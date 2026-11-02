
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const rateLimit = require("express-rate-limit");
const { Resend } = require("resend");
const { createClient } = require("@supabase/supabase-js");
const multer = require("multer");
const { randomUUID } = require("crypto");

const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new Error("Only PNG, JPG, and WebP images are allowed.")
      );
    }

    callback(null, true);
  },
});

const supabaseStorage = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();
app.set("trust proxy", 1);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(
      process.env.NODE_ENV === "production"
        ? "/etc/secrets/supabase-ca.crt"
        : path.join(__dirname, "supabase-ca.crt"),
      "utf8"
    ),
  },
});

const allowedOrigins = [
  "http://localhost:5173",
  "https://shreya-portfolio-eight-alpha.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));


app.use(express.json({ limit: "10kb" }));

async function requireAdmin(req, res, next) {
  try {
    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please sign in to continue.",
      });
    }

    const { data, error } = await supabaseAuth.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        success: false,
        message: "Your session is invalid or expired. Please sign in again.",
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const userEmail = data.user.email?.trim().toLowerCase();

    if (!adminEmail || !userEmail || userEmail !== adminEmail) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to manage projects.",
      });
    }

    req.adminUser = data.user;
    next();
  } catch (error) {
    console.error("Admin authentication failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify admin access.",
    });
  }
}

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many messages. Please try again in 15 minutes.",
  },
});

const validProjectFields = (body) => {
  const {
    title,
    description,
    image_url,
    project_url,
    github_url,
    technologies,
    display_order,
    is_published,
  } = body;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    title.trim().length > 200 ||
    typeof description !== "string" ||
    !description.trim() ||
    description.trim().length > 5000
  ) {
    return { error: "Title and description are required." };
  }

  for (const value of [image_url, project_url, github_url]) {
    if (
      value != null &&
      (typeof value !== "string" || value.length > 2048)
    ) {
      return { error: "Image and project links must be valid text." };
    }

    if (typeof value === "string" && value.trim()) {
      try {
        const url = new URL(value.trim());
        if (!["http:", "https:"].includes(url.protocol)) {
          return { error: "Links must use HTTP or HTTPS." };
        }
      } catch {
        return { error: "Please enter valid URLs for project links." };
      }
    }
  }

  if (
    technologies != null &&
    (!Array.isArray(technologies) ||
      technologies.length > 30 ||
      !technologies.every(
        (item) => typeof item === "string" && item.trim().length <= 50
      ))
  ) {
    return { error: "Technologies must be a list of text values." };
  }

  if (
    display_order != null &&
    (!Number.isInteger(display_order) ||
      display_order < 0 ||
      display_order > 100000)
  ) {
    return { error: "Display order must be a non-negative whole number." };
  }

  if (is_published != null && typeof is_published !== "boolean") {
    return { error: "Publish status must be true or false." };
  }

  return {
    values: {
      title: title.trim(),
      description: description.trim(),
      image_url: image_url?.trim() || null,
      project_url: project_url?.trim() || null,
      github_url: github_url?.trim() || null,
      technologies: (technologies || []).map((item) => item.trim()),
      display_order: display_order ?? 0,
      is_published: is_published ?? false,
    },
  };
};


app.get("/api/admin/projects", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description, image_url, project_url,
              github_url, technologies, display_order, is_published,
              created_at, updated_at
       FROM public.projects
       ORDER BY display_order ASC, created_at DESC`
    );

    res.json({ success: true, projects: result.rows });
  } catch (error) {
    console.error("Unable to fetch admin projects:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to load projects.",
    });
  }
});


// Add a project.
app.post("/api/admin/projects", requireAdmin, async (req, res) => {
  const validation = validProjectFields(req.body || {});

  if (validation.error) {
    return res.status(400).json({
      success: false,
      message: validation.error,
    });
  }

  const p = validation.values;

  try {
    const result = await pool.query(
      `INSERT INTO public.projects
       (title, description, image_url, project_url, github_url,
        technologies, display_order, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        p.title,
        p.description,
        p.image_url,
        p.project_url,
        p.github_url,
        p.technologies,
        p.display_order,
        p.is_published,
      ]
    );

    res.status(201).json({
      success: true,
      project: result.rows[0],
    });
  } catch (error) {
    console.error("Unable to create project:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to create project.",
    });
  }
});

// Edit an existing project.
app.put("/api/admin/projects/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;

  if (!/^\d+$/.test(id) || id === "0") {
    return res.status(400).json({
      success: false,
      message: "Invalid project ID.",
    });
  }

  const validation = validProjectFields(req.body || {});

  if (validation.error) {
    return res.status(400).json({
      success: false,
      message: validation.error,
    });
  }

  const p = validation.values;

  try {
    const result = await pool.query(
      `UPDATE public.projects
       SET title = $1, description = $2, image_url = $3,
           project_url = $4, github_url = $5, technologies = $6,
           display_order = $7, is_published = $8,
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        p.title,
        p.description,
        p.image_url,
        p.project_url,
        p.github_url,
        p.technologies,
        p.display_order,
        p.is_published,
        id,
      ]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    res.json({ success: true, project: result.rows[0] });
  } catch (error) {
    console.error("Unable to update project:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to update project.",
    });
  }
});

// Publish or unpublish a project.
app.patch(
  "/api/admin/projects/:id/publish",
  requireAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { is_published } = req.body || {};

    if (!/^\d+$/.test(id) || id === "0") {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    if (typeof is_published !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Provide is_published as true or false.",
      });
    }

    try {
      const result = await pool.query(
        `UPDATE public.projects
         SET is_published = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [is_published, id]
      );

      if (!result.rowCount) {
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

      res.json({ success: true, project: result.rows[0] });
    } catch (error) {
      console.error("Unable to change publish status:", error.message);
      res.status(500).json({
        success: false,
        message: "Unable to change publish status.",
      });
    }
  }
);

// Delete a project.
app.delete("/api/admin/projects/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;

  if (!/^\d+$/.test(id) || id === "0") {
    return res.status(400).json({
      success: false,
      message: "Invalid project ID.",
    });
  }

  try {
    const result = await pool.query(
      `DELETE FROM public.projects WHERE id = $1 RETURNING id`,
      [id]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    res.json({ success: true, message: "Project deleted successfully." });
  } catch (error) {
    console.error("Unable to delete project:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to delete project.",
    });
  }
});

// Test the database connection
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      success: true,
      message: "Portfolio backend and PostgreSQL are connected!",
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed.",
    });
  }
});

// Receive contact form messages
app.post("/api/contact", contactLimiter, async (req, res) => {
  const { name, email, message } = req.body;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !message.trim() ||
    name.trim().length > 100 ||
    email.trim().length > 254 ||
    message.trim().length > 5000 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return res.status(400).json({
      success: false,
      message: "Please enter valid contact details and a message.",
    });
  }

  try {
    // 1. Save the message to Supabase
    const result = await pool.query(
      `INSERT INTO public.contact_messages (name, email, message)
       VALUES ($1, $2, $3)
       RETURNING id, created_at`,
      [name.trim(), email.trim(), message.trim()]
    );

    // 2. Send email notification (without failing the form if email fails)
    try {
      const { data, error } = await resend.emails.send({
        from: "Portfolio Contact <onboarding@resend.dev>",
        to: ["shreyamirajkar.05@gmail.com"],
        subject: `New portfolio message from ${name.trim()}`,
        text: `You received a new message through your portfolio.

Name: ${name.trim()}
Email: ${email.trim()}

Message:
${message.trim()}`,
      });

      if (error) {
        console.error("Email notification failed:", error);
      } else {
        console.log("Email notification sent:", data.id);
      }
    } catch (emailError) {
      console.error(
        "Email notification failed:",
        emailError.message
      );
    }

    // 3. Return success when the message is saved
    return res.status(201).json({
      success: true,
      message: "Your message was saved successfully!",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Contact submission failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to save your message. Please try again.",
    });
  }
});

const PORT = process.env.PORT || 5000;
app.post(
  "/api/admin/upload-image",
  requireAdmin,
  (req, res, next) => {
    imageUpload.single("image")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          error: err.message || "Image upload failed.",
        });
      }

      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Please select an image.",
        });
      }

      const extensions = {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/webp": "webp",
      };

      const filePath =
        `projects/${randomUUID()}.${extensions[req.file.mimetype]}`;

      const { error: uploadError } = await supabaseStorage
        .storage
        .from("portfolio-media")
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase image upload failed:", uploadError.message);

        return res.status(500).json({
          error: "Could not upload the image. Please try again.",
        });
      }

      const { data } = supabaseStorage
        .storage
        .from("portfolio-media")
        .getPublicUrl(filePath);

      return res.status(201).json({
        image_url: data.publicUrl,
        path: filePath,
      });
    } catch (error) {
      console.error("Image upload error:", error.message);

      return res.status(500).json({
        error: "An unexpected image upload error occurred.",
      });
    }
  }
);

app.post(
  "/api/admin/upload-images",
  requireAdmin,
  (req, res, next) => {
    imageUpload.array("images", 20)(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Image upload failed.",
        });
      }

      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please select at least one image.",
        });
      }

      const extensions = {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/webp": "webp",
      };

      const uploadedImages = await Promise.all(
        req.files.map(async (file) => {
          const filePath = `case-studies/${randomUUID()}.${extensions[file.mimetype]}`;

          const { error } = await supabaseStorage
            .storage
            .from("portfolio-media")
            .upload(filePath, file.buffer, {
              contentType: file.mimetype,
              cacheControl: "3600",
              upsert: false,
            });

          if (error) {
            throw error;
          }

          const { data } = supabaseStorage
            .storage
            .from("portfolio-media")
            .getPublicUrl(filePath);

          return {
            image_url: data.publicUrl,
            path: filePath,
          };
        })
      );

      return res.status(201).json({
        success: true,
        images: uploadedImages,
      });
    } catch (error) {
      console.error("Multiple image upload failed:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to upload images. Please try again.",
      });
    }
  }
);

const allowedSectionLayouts = [
  "text",
  "text-image",
  "image-text",
  "full-width-image",
  "gallery",
];

const allowedSectionAnimations = [
  "none",
  "fade-up",
  "fade-in",
  "slide-left",
  "slide-right",
];

const allowedBlockTypes = [
  "text",
  "image",
  "gallery",
  "video",
  "image-text",
  "before-after",
  "feature-cards",
  "full-width-banner",
];

app.get("/api/projects", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description, image_url, project_url,
              github_url, technologies, display_order
       FROM public.projects
       WHERE is_published = TRUE
       ORDER BY display_order ASC, created_at DESC`
    );

    return res.json({
      success: true,
      projects: result.rows,
    });
  } catch (error) {
    console.error("Unable to fetch public projects:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load projects.",
    });
  }
});

app.get("/api/projects/:projectId", async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);

    if (!Number.isSafeInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    const result = await pool.query(
      `SELECT id, title, description, image_url, project_url,
              github_url, technologies
       FROM public.projects
       WHERE id = $1 AND is_published = TRUE`,
      [projectId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    return res.json({
      success: true,
      project: result.rows[0],
    });
  } catch (error) {
    console.error("Unable to fetch project:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load project.",
    });
  }
});

app.get("/api/projects", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description, image_url, project_url,
              github_url, technologies, display_order
       FROM public.projects
       WHERE is_published = TRUE
       ORDER BY display_order ASC, created_at DESC`
    );

    return res.json({
      success: true,
      projects: result.rows,
    });
  } catch (error) {
    console.error("Unable to fetch public projects:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load projects.",
    });
  }
});

// PUBLIC: Get sections for a published project
app.get("/api/projects/:projectId/sections", async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);

    if (!Number.isSafeInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    
const result = await pool.query(
  `SELECT id, project_id, title, label, body, layout, image_urls,
          cards, display_order, animation, created_at, updated_at
   FROM public.case_study_sections
   WHERE project_id = $1
   ORDER BY display_order ASC, id ASC`,
  [projectId]
);


    return res.json({
      success: true,
      sections: result.rows,
    });
  } catch (error) {
    console.error("Unable to fetch case-study sections:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to load case-study sections.",
    });
  }
});

// ADMIN: Get sections, including those belonging to unpublished projects
app.get(
  "/api/admin/projects/:projectId/sections",
  requireAdmin,
  async (req, res) => {
    try {
      const projectId = Number(req.params.projectId);

      if (!Number.isSafeInteger(projectId) || projectId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID.",
        });
      }

      const project = await pool.query(
        "SELECT id FROM public.projects WHERE id = $1",
        [projectId]
      );

      if (project.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

       

const result = await pool.query(
  `SELECT id, project_id, title, label, body, layout, image_urls,
          cards, display_order, animation, created_at, updated_at
   FROM public.case_study_sections
   WHERE project_id = $1
   ORDER BY display_order ASC, id ASC`,
  [projectId]
);



      return res.json({
        success: true,
        sections: result.rows,
      });
    } catch (error) {
      console.error("Unable to fetch admin sections:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to load case-study sections.",
      });
    }
  }
);

// ADMIN: Create a case-study section
app.post(
  "/api/admin/projects/:projectId/sections",
  requireAdmin,
  async (req, res) => {
    try {
      const projectId = Number(req.params.projectId);
      const {
  title = "",
  label = "",
  body = "",
  layout = "text-image",
  image_urls = [],
  cards = [],
  display_order = 0,
  animation = "fade-up",
} = req.body || {};

      if (!Number.isSafeInteger(projectId) || projectId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID.",
        });
      }

      if (
  typeof title !== "string" ||
  typeof label !== "string" ||
  typeof body !== "string"
) {
  return res.status(400).json({
    success: false,
    message: "Title, label and body must be text.",
  });
}

if (
  !Array.isArray(cards) ||
  !cards.every(
    (card) =>
      card &&
      typeof card === "object" &&
      !Array.isArray(card) &&
      typeof card.title === "string" &&
      typeof card.description === "string" &&
      (card.number === undefined || typeof card.number === "string")
  )
) {
  return res.status(400).json({
    success: false,
    message: "Cards must contain valid titles and descriptions.",
  });
}

      if (!allowedSectionLayouts.includes(layout)) {
        return res.status(400).json({
          success: false,
          message: "Invalid section layout.",
        });
      }

      if (!allowedSectionAnimations.includes(animation)) {
        return res.status(400).json({
          success: false,
          message: "Invalid section animation.",
        });
      }

      if (
        !Array.isArray(image_urls) ||
        !image_urls.every(
          (url) => typeof url === "string" && url.length <= 2048
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Images must be provided as a list of URLs.",
        });
      }

      const order = Number(display_order);

      if (!Number.isSafeInteger(order) || order < 0) {
        return res.status(400).json({
          success: false,
          message: "Display order must be a non-negative integer.",
        });
      }

      const project = await pool.query(
        "SELECT id FROM public.projects WHERE id = $1",
        [projectId]
      );

      if (project.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

      const result = await pool.query(
  `INSERT INTO public.case_study_sections
     (project_id, title, label, body, layout, image_urls,
      cards, display_order, animation)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
   RETURNING id, project_id, title, label, body, layout, image_urls,
             cards, display_order, animation, created_at, updated_at`,
  [
    projectId,
    title.trim(),
    label.trim(),
    body,
    layout,
    image_urls,
    JSON.stringify(cards),
    order,
    animation,
  ]
);

      return res.status(201).json({
        success: true,
        section: result.rows[0],
      });
    } catch (error) {
      console.error("Unable to create case-study section:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to create the case-study section.",
      });
    }
  }
);

    


 // ADMIN: Update a case-study section
app.put(
  "/api/admin/sections/:sectionId",
  requireAdmin,
  async (req, res) => {
    try {
      const sectionId = Number(req.params.sectionId);

      const {
  title,
  label,
  body,
  layout,
  image_urls,
  display_order,
  animation,
  cards,
} = req.body || {};

      if (!Number.isSafeInteger(sectionId) || sectionId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid section ID.",
        });
      }

      if (title !== undefined && typeof title !== "string") {
        return res.status(400).json({
          success: false,
          message: "Title must be text.",
        });
      }

      if (label !== undefined && typeof label !== "string") {
        return res.status(400).json({
          success: false,
          message: "Label must be text.",
        });
      }

      if (body !== undefined && typeof body !== "string") {
        return res.status(400).json({
          success: false,
          message: "Body must be text.",
        });
      }

      if (layout !== undefined && !allowedSectionLayouts.includes(layout)) {
        return res.status(400).json({
          success: false,
          message: "Invalid section layout.",
        });
      }

      if (
        animation !== undefined &&
        !allowedSectionAnimations.includes(animation)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid section animation.",
        });
      }

      if (
        image_urls !== undefined &&
        (!Array.isArray(image_urls) ||
          !image_urls.every(
            (url) => typeof url === "string" && url.length <= 2048
          ))
      ) {
        return res.status(400).json({
          success: false,
          message: "Images must be provided as a list of URLs.",
        });
      }

      if (
  cards !== undefined &&
  (!Array.isArray(cards) ||
    !cards.every(
      (card) =>
        card &&
        typeof card === "object" &&
        !Array.isArray(card) &&
        typeof card.title === "string" &&
        typeof card.description === "string" &&
        (card.number === undefined || typeof card.number === "string")
    ))
) {
  return res.status(400).json({
    success: false,
    message: "Cards must contain valid titles and descriptions.",
  });
}

      let order = null;

      if (display_order !== undefined) {
        order = Number(display_order);

        if (!Number.isSafeInteger(order) || order < 0) {
          return res.status(400).json({
            success: false,
            message: "Display order must be a non-negative integer.",
          });
        }
      }
      
      const result = await pool.query(
  `UPDATE public.case_study_sections
   SET title = COALESCE($1, title),
       label = COALESCE($2, label),
       body = COALESCE($3, body),
       layout = COALESCE($4, layout),
       image_urls = COALESCE($5::text[], image_urls),
       cards = COALESCE($6::jsonb, cards),
       display_order = COALESCE($7, display_order),
       animation = COALESCE($8, animation),
       updated_at = NOW()
   WHERE id = $9
   RETURNING id, project_id, title, label, body, layout, image_urls,
             cards, display_order, animation, created_at, updated_at`,
  [
    title === undefined ? null : title.trim(),
    label === undefined ? null : label.trim(),
    body === undefined ? null : body,
    layout === undefined ? null : layout,
    image_urls === undefined ? null : image_urls,
    cards === undefined ? null : JSON.stringify(cards),
    order,
    animation === undefined ? null : animation,
    sectionId,
  ]
);

      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Case-study section not found.",
        });
      }

      return res.json({
        success: true,
        section: result.rows[0],
      });
    } catch (error) {
      console.error("Unable to update case-study section:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to update the case-study section.",
      });
    }
  }
);

// ADMIN: Delete a case-study section
app.delete(
  "/api/admin/sections/:sectionId",
  requireAdmin,
  async (req, res) => {
    try {
      const sectionId = Number(req.params.sectionId);

      if (!Number.isSafeInteger(sectionId) || sectionId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid section ID.",
        });
      }

      const result = await pool.query(
        `DELETE FROM public.case_study_sections
         WHERE id = $1
         RETURNING id`,
        [sectionId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Case-study section not found.",
        });
      }

      return res.json({
        success: true,
        message: "Case-study section deleted.",
      });
    } catch (error) {
      console.error("Unable to delete case-study section:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to delete the case-study section.",
      });
    }
  }
);

app.get(
  "/api/admin/projects/:projectId/blocks",
  requireAdmin,
  async (req, res) => {
    try {
      const projectId = Number(req.params.projectId);

      if (!Number.isSafeInteger(projectId) || projectId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID.",
        });
      }

      const project = await pool.query(
        "SELECT id FROM public.projects WHERE id = $1",
        [projectId]
      );

      if (project.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

      const result = await pool.query(
        `SELECT id, project_id, block_type, content, display_order,
                is_visible, created_at, updated_at
         FROM public.case_study_blocks
         WHERE project_id = $1
         ORDER BY display_order ASC, id ASC`,
        [projectId]
      );

      return res.json({
        success: true,
        blocks: result.rows,
      });
    } catch (error) {
      console.error("Unable to fetch case-study blocks:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to load case-study blocks.",
      });
    }
  }
);

app.post(
  "/api/admin/projects/:projectId/blocks",
  requireAdmin,
  async (req, res) => {
    try {
      const projectId = Number(req.params.projectId);
      const {
        block_type,
        content = {},
        display_order = 0,
        is_visible = true,
      } = req.body || {};

      if (!Number.isSafeInteger(projectId) || projectId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID.",
        });
      }

      if (!allowedBlockTypes.includes(block_type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid block type.",
        });
      }

      if (
        !content ||
        typeof content !== "object" ||
        Array.isArray(content)
      ) {
        return res.status(400).json({
          success: false,
          message: "Block content must be an object.",
        });
      }

      const order = Number(display_order);

      if (!Number.isSafeInteger(order) || order < 0) {
        return res.status(400).json({
          success: false,
          message: "Display order must be a non-negative integer.",
        });
      }

      if (typeof is_visible !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "Visibility must be true or false.",
        });
      }

      const project = await pool.query(
        "SELECT id FROM public.projects WHERE id = $1",
        [projectId]
      );

      if (project.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

      const result = await pool.query(
        `INSERT INTO public.case_study_blocks
           (project_id, block_type, content, display_order, is_visible)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, project_id, block_type, content, display_order,
                   is_visible, created_at, updated_at`,
        [
          projectId,
          block_type,
          JSON.stringify(content),
          order,
          is_visible,
        ]
      );

      return res.status(201).json({
        success: true,
        block: result.rows[0],
      });
    } catch (error) {
      console.error("Unable to create case-study block:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to create the case-study block.",
      });
    }
  }
);

app.put(
  "/api/admin/blocks/:blockId",
  requireAdmin,
  async (req, res) => {
    try {
      const blockId = Number(req.params.blockId);
      const {
        block_type,
        content,
        display_order,
        is_visible,
      } = req.body || {};

      if (!Number.isSafeInteger(blockId) || blockId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid block ID.",
        });
      }

      if (
        block_type !== undefined &&
        !allowedBlockTypes.includes(block_type)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid block type.",
        });
      }

      if (
        content !== undefined &&
        (!content ||
          typeof content !== "object" ||
          Array.isArray(content))
      ) {
        return res.status(400).json({
          success: false,
          message: "Block content must be an object.",
        });
      }

      let order = null;

      if (display_order !== undefined) {
        order = Number(display_order);

        if (!Number.isSafeInteger(order) || order < 0) {
          return res.status(400).json({
            success: false,
            message: "Display order must be a non-negative integer.",
          });
        }
      }

      if (
        is_visible !== undefined &&
        typeof is_visible !== "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message: "Visibility must be true or false.",
        });
      }

      const result = await pool.query(
        `UPDATE public.case_study_blocks
         SET block_type = COALESCE($1, block_type),
             content = COALESCE($2::jsonb, content),
             display_order = COALESCE($3, display_order),
             is_visible = COALESCE($4, is_visible),
             updated_at = NOW()
         WHERE id = $5
         RETURNING id, project_id, block_type, content, display_order,
                   is_visible, created_at, updated_at`,
        [
          block_type === undefined ? null : block_type,
          content === undefined ? null : JSON.stringify(content),
          order,
          is_visible === undefined ? null : is_visible,
          blockId,
        ]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Block not found.",
        });
      }

      return res.json({
        success: true,
        block: result.rows[0],
      });
    } catch (error) {
      console.error("Unable to update case-study block:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to update the case-study block.",
      });
    }
  }
);

app.delete(
  "/api/admin/blocks/:blockId",
  requireAdmin,
  async (req, res) => {
    try {
      const blockId = Number(req.params.blockId);

      if (!Number.isSafeInteger(blockId) || blockId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid block ID.",
        });
      }

      const result = await pool.query(
        `DELETE FROM public.case_study_blocks
         WHERE id = $1
         RETURNING id`,
        [blockId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Block not found.",
        });
      }

      return res.json({
        success: true,
        message: "Case-study block deleted successfully.",
      });
    } catch (error) {
      console.error("Unable to delete case-study block:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to delete the case-study block.",
      });
    }
  }
);

app.get("/api/projects/:projectId/blocks", async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);

    if (!Number.isSafeInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    const result = await pool.query(
      `SELECT id, project_id, block_type, content, display_order
       FROM public.case_study_blocks
       WHERE project_id = $1 AND is_visible = TRUE
       ORDER BY display_order ASC, id ASC`,
      [projectId]
    );

    return res.json({
      success: true,
      blocks: result.rows,
    });
  } catch (error) {
    console.error("Unable to fetch public blocks:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load project blocks.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});
