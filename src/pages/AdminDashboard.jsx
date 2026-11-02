
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

import API_URL from "../config";

const emptyProject = {
  title: "",
  description: "",
  image_url: "",
  project_url: "",
  github_url: "",
  technologies: "",
  display_order: 0,
  is_published: false,
};
export default function AdminDashboard() {

  const navigate = useNavigate();
  const caseStudyEditorRef = useRef(null);
const flexibleEditorRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyProject);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingSectionImages, setUploadingSectionImages] = useState(false);
const [uploadingBlockImages, setUploadingBlockImages] = useState(false);
  
  const [selectedProjectId, setSelectedProjectId] = useState("");
const [selectedBlockProjectId, setSelectedBlockProjectId] = useState("");
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [sectionSaving, setSectionSaving] = useState(false);
  const [sectionError, setSectionError] = useState("");
  const [sectionMessage, setSectionMessage] = useState("");

  
const publishedCount = projects.filter(
  (project) => project.is_published
).length;

const draftCount = projects.length - publishedCount;

const emptySection = {
  title: "",
  label: "",
  body: "",
  layout: "text-image",
  image_urls: [],
  cards: [],
  display_order: 0,
  animation: "fade-up",
};


  const [sectionForm, setSectionForm] = useState(emptySection);
  
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [blocks, setBlocks] = useState([]);
const [loadingBlocks, setLoadingBlocks] = useState(false);
const [blockSaving, setBlockSaving] = useState(false);
const [blockError, setBlockError] = useState("");
const [blockMessage, setBlockMessage] = useState("");
const [editingBlockId, setEditingBlockId] = useState(null);

const emptyBlock = {
  block_type: "text",
  content: {},
  display_order: 0,
  is_visible: true,
};
const [blockForm, setBlockForm] = useState(emptyBlock);


  const getToken = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;
    if (!data.session) {
      navigate("/admin", { replace: true });
      throw new Error("Please sign in to access the dashboard.");
    }

    return data.session.access_token;
  }, [navigate]);

  
  
const apiRequest = useCallback(async (path, options = {}) => {
  const token = await getToken();
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || result.error || "Request failed."
    );
  }

  return result;
}, [getToken]);


  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await apiRequest("/api/admin/projects");
      setProjects(result.projects || []);
    } catch (err) {
      setError(err.message || "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  const loadSections = useCallback(async (projectId) => {
    if (!projectId) {
      setSections([]);
      return;
    }

    setLoadingSections(true);
    setSectionError("");
    setSectionMessage("");

    try {
      const result = await apiRequest(
        `/api/admin/projects/${projectId}/sections`
      );

      setSections(result.sections || []);
    } catch (err) {
      setSectionError(err.message || "Unable to load case-study sections.");
      setSections([]);
    } finally {
      setLoadingSections(false);
    }
  }, [apiRequest]);
  
  const loadBlocks = useCallback(async (projectId) => {
  if (!projectId) {
    setBlocks([]);
    return;
  }

  setLoadingBlocks(true);
  setBlockError("");
  setBlockMessage("");

  try {
    const result = await apiRequest(
      `/api/admin/projects/${projectId}/blocks`
    );

    setBlocks(result.blocks || []);
  } catch (err) {
    setBlockError(err.message || "Unable to load content blocks.");
    setBlocks([]);
  } finally {
    setLoadingBlocks(false);
  }
}, [apiRequest]);

  const handleSelectSectionProject = (projectId) => {
  setSelectedProjectId(projectId);
  setSections([]);
  setSectionForm({ ...emptySection });
  setEditingSectionId(null);
  setSectionError("");
  setSectionMessage("");

  if (projectId) {
    loadSections(projectId);
  }
};

const handleSelectBlockProject = (projectId) => {
  setSelectedBlockProjectId(projectId);
  setBlocks([]);
  setBlockForm({ ...emptyBlock });
  setEditingBlockId(null);
  setBlockError("");
  setBlockMessage("");

  if (projectId) {
    loadBlocks(projectId);
  }
};
  
  const handleAddSection = async (event) => {
    event.preventDefault();

    if (!selectedProjectId) {
      setSectionError("Please select a project first.");
      return;
    }

    setSectionSaving(true);
    setSectionError("");
    setSectionMessage("");

    try {
      await apiRequest(
        `/api/admin/projects/${selectedProjectId}/sections`,
        {
          method: "POST",
          body: JSON.stringify({
            ...sectionForm,
            display_order: Number(sectionForm.display_order),
          }),
        }
      );

      setSectionForm({ ...emptySection });
      await loadSections(selectedProjectId);
      setSectionMessage("Section added successfully!");
    } catch (err) {
      setSectionError(
        err.message || "Unable to add the case-study section."
      );
    } finally {
      setSectionSaving(false);
    }
  };

  
const handleEditSection = (section) => {
  setEditingSectionId(section.id);

  setSectionForm({
    title: section.title || "",
    label: section.label || "",
    body: section.body || "",
    layout: section.layout || "text-image",
    image_urls: section.image_urls || [],
    cards: section.cards || [],
    display_order: section.display_order ?? 0,
    animation: section.animation || "fade-up",
  });

  setSectionError("");
  setSectionMessage("");
};


const handleAddCard = () => {
  setSectionForm((prev) => ({
    ...prev,
    cards: [
      ...(prev.cards || []),
      {
        number: String((prev.cards || []).length + 1).padStart(2, "0"),
        title: "",
        description: "",
      },
    ],
  }));
};

const handleChangeCard = (index, field, value) => {
  setSectionForm((prev) => ({
    ...prev,
    cards: prev.cards.map((card, cardIndex) =>
      cardIndex === index
        ? { ...card, [field]: value }
        : card
    ),
  }));
};

const handleDeleteCard = (index) => {
  setSectionForm((prev) => ({
    ...prev,
    cards: prev.cards
      .filter((_, cardIndex) => cardIndex !== index)
      .map((card, cardIndex) => ({
        ...card,
        number: String(cardIndex + 1).padStart(2, "0"),
      })),
  }));
};

const handleUpdateSection = async (event) => {
  event.preventDefault();

  if (!editingSectionId) {
    setSectionError("Please select a section to edit.");
    return;
  }

  setSectionSaving(true);
  setSectionError("");
  setSectionMessage("");

  try {
    await apiRequest(`/api/admin/sections/${editingSectionId}`, {
      method: "PUT",
      body: JSON.stringify({
        ...sectionForm,
        display_order: Number(sectionForm.display_order),
      }),
    });

    setEditingSectionId(null);
    setSectionForm({ ...emptySection });
    await loadSections(selectedProjectId);
    setSectionMessage("Section updated successfully!");
  } catch (err) {
    setSectionError(
      err.message || "Unable to update the case-study section."
    );
  } finally {
    setSectionSaving(false);
  }
};



  const handleDeleteSection = async (section) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${section.title || "Untitled section"}"?`
    );

    if (!confirmed) return;

    setSectionError("");
    setSectionMessage("");

    try {
      await apiRequest(`/api/admin/sections/${section.id}`, {
        method: "DELETE",
      });

      if (editingSectionId === section.id) {
        setEditingSectionId(null);
        setSectionForm({ ...emptySection });
      }

      await loadSections(selectedProjectId);
      setSectionMessage("Section deleted successfully!");
    } catch (err) {
      setSectionError(
        err.message || "Unable to delete the case-study section."
      );
    }
  };


  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];

    // Allow choosing the same file again later.
    event.target.value = "";

    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please choose a PNG, JPG, or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("The image must be 5 MB or smaller.");
      return;
    }

    setUploadingImage(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const result = await apiRequest("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      setForm((current) => ({
        ...current,
        image_url: result.image_url,
      }));

      setMessage("Image uploaded successfully!");
    } catch (err) {
      setError(err.message || "Unable to upload image.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSectionImageUpload(event) {
  const files = Array.from(event.target.files || []);
  event.target.value = "";

  if (!files.length) return;

  if (files.some((file) => !["image/png", "image/jpeg", "image/webp"].includes(file.type))) {
    setSectionError("Choose only PNG, JPG, or WebP images.");
    return;
  }

  if (files.some((file) => file.size > 5 * 1024 * 1024)) {
    setSectionError("Each image must be 5 MB or smaller.");
    return;
  }

  setUploadingSectionImages(true);
  setSectionError("");
  setSectionMessage("");

  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const result = await apiRequest("/api/admin/upload-images", {
      method: "POST",
      body: formData,
    });

    setSectionForm((current) => ({
      ...current,
      image_urls: [
        ...(current.image_urls || []),
        ...result.images.map((image) => image.image_url),
      ],
    }));

    setSectionMessage(`${result.images.length} image(s) uploaded successfully!`);
  } catch (err) {
    setSectionError(err.message || "Unable to upload images.");
  } finally {
    setUploadingSectionImages(false);
  }
}

function moveSectionImage(index, direction) {
  setSectionForm((current) => {
    const images = [...current.image_urls];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= images.length) return current;

    [images[index], images[targetIndex]] = [images[targetIndex], images[index]];

    return { ...current, image_urls: images };
  });
}

function removeSectionImage(index) {
  setSectionForm((current) => ({
    ...current,
    image_urls: current.image_urls.filter((_, imageIndex) => imageIndex !== index),
  }));
}

async function handleBlockImageUpload(event) {
  const target = event.currentTarget.dataset.target || "images";
  const files = Array.from(event.target.files || []);
  event.target.value = "";

  if (!files.length) return;

  if (files.some((file) => !["image/png", "image/jpeg", "image/webp"].includes(file.type))) {
    setBlockError("Choose only PNG, JPG, or WebP images.");
    return;
  }

  if (files.some((file) => file.size > 5 * 1024 * 1024)) {
    setBlockError("Each image must be 5 MB or smaller.");
    return;
  }

  setUploadingBlockImages(true);
  setBlockError("");
  setBlockMessage("");

  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const result = await apiRequest("/api/admin/upload-images", {
      method: "POST",
      body: formData,
    });

    const urls = result.images.map((image) => image.image_url);

    setBlockForm((current) => {
      const content = { ...current.content };

      if (target === "beforeImageUrl" || target === "afterImageUrl") {
        content[target] = urls[0];
      } else {
        const imageUrls = [
          ...(content.imageUrls || (content.imageUrl ? [content.imageUrl] : [])),
          ...urls,
        ];
        content.imageUrls = imageUrls;
        content.imageUrl = imageUrls[0] || "";
      }

      return { ...current, content };
    });

    setBlockMessage(`${urls.length} image(s) uploaded successfully!`);
  } catch (err) {
    setBlockError(err.message || "Unable to upload images.");
  } finally {
    setUploadingBlockImages(false);
  }
}

function removeBlockImage(index) {
  setBlockForm((current) => {
    const imageUrls = [...(current.content.imageUrls || [])];
    imageUrls.splice(index, 1);

    return {
      ...current,
      content: {
        ...current.content,
        imageUrls,
        imageUrl: imageUrls[0] || "",
      },
    };
  });
}

function moveBlockImage(index, direction) {
  setBlockForm((current) => {
    const imageUrls = [...(current.content.imageUrls || [])];
    const target = index + direction;

    if (target < 0 || target >= imageUrls.length) return current;

    [imageUrls[index], imageUrls[target]] = [imageUrls[target], imageUrls[index]];

    return {
      ...current,
      content: {
        ...current.content,
        imageUrls,
        imageUrl: imageUrls[0] || "",
      },
    };
  });
}

  async function handleAddProject(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const result = await apiRequest("/api/admin/projects", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          technologies: form.technologies
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          display_order: Number(form.display_order),
        }),
      });

      setProjects((current) => [...current, result.project]);
      setForm(emptyProject);
      setMessage("Project added successfully!");
    } catch (err) {
      setError(err.message || "Unable to add project.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddBlock() {
  if (!selectedBlockProjectId) {
    setBlockError("Please select a project first.");
    return;
  }

  setBlockSaving(true);
  setBlockError("");
  setBlockMessage("");

  try {
    const result = await apiRequest(
     `/api/admin/projects/${selectedBlockProjectId}/blocks`,
      {
        method: "POST",
        body: JSON.stringify({
          ...blockForm,
          display_order: Number(blockForm.display_order),
        }),
      }
    );

    setBlocks((current) => [...current, result.block]);
    setBlockForm({
      ...emptyBlock,
      display_order: Number(blockForm.display_order) + 1,
    });
    setBlockMessage("Block added successfully!");
  } catch (err) {
    setBlockError(err.message || "Unable to add block.");
  } finally {
    setBlockSaving(false);
  }
}

async function handleUpdateBlock(blockId) {
  setBlockSaving(true);
  setBlockError("");
  setBlockMessage("");

  try {
    const result = await apiRequest(`/api/admin/blocks/${blockId}`, {
      method: "PUT",
      body: JSON.stringify({
        ...blockForm,
        display_order: Number(blockForm.display_order),
      }),
    });

    setBlocks((current) =>
      current.map((block) =>
        block.id === blockId ? result.block : block
      )
    );

    setEditingBlockId(null);
    setBlockForm(emptyBlock);
    setBlockMessage("Block updated successfully!");
  } catch (err) {
    setBlockError(err.message || "Unable to update block.");
  } finally {
    setBlockSaving(false);
  }
}

async function handleDeleteBlock(block) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this block?"
  );

  if (!confirmed) return;

  setBlockSaving(true);
  setBlockError("");
  setBlockMessage("");

  try {
    await apiRequest(`/api/admin/blocks/${block.id}`, {
      method: "DELETE",
    });

    setBlocks((current) =>
      current.filter((item) => item.id !== block.id)
    );

    setBlockMessage("Block deleted successfully!");
  } catch (err) {
    setBlockError(err.message || "Unable to delete block.");
  } finally {
    setBlockSaving(false);
  }
}

async function handleMoveBlock(block, direction) {
  const currentIndex = blocks.findIndex(
    (item) => item.id === block.id
  );

  const targetIndex = currentIndex + direction;

  if (targetIndex < 0 || targetIndex >= blocks.length) return;

  const reorderedBlocks = [...blocks];

  [reorderedBlocks[currentIndex], reorderedBlocks[targetIndex]] = [
    reorderedBlocks[targetIndex],
    reorderedBlocks[currentIndex],
  ];

  setBlockSaving(true);
  setBlockError("");
  setBlockMessage("");

  try {
    await Promise.all(
      reorderedBlocks.map((item, index) =>
        apiRequest(`/api/admin/blocks/${item.id}`, {
          method: "PUT",
          body: JSON.stringify({
            display_order: index,
          }),
        })
      )
    );

    setBlocks(
      reorderedBlocks.map((item, index) => ({
        ...item,
        display_order: index,
      }))
    );

    setBlockMessage("Block order updated!");
  } catch (err) {
    setBlockError(err.message || "Unable to reorder blocks.");
    await loadBlocks(selectedBlockProjectId);
  } finally {
    setBlockSaving(false);
  }
}

  async function togglePublished(project) {
    setError("");
    setMessage("");

    try {
      const result = await apiRequest(
        `/api/admin/projects/${project.id}/publish`,
        {
          method: "PATCH",
          body: JSON.stringify({
            is_published: !project.is_published,
          }),
        }
      );

      setProjects((current) =>
        current.map((item) =>
          item.id === project.id ? result.project : item
        )
      );
      setMessage("Project visibility updated.");
    } catch (err) {
      setError(err.message || "Unable to update visibility.");
    }
  }

  async function deleteProject(project) {
    if (!window.confirm(`Delete "${project.title}" permanently?`)) return;

    setError("");
    setMessage("");

    try {
      await apiRequest(`/api/admin/projects/${project.id}`, {
        method: "DELETE",
      });

      setProjects((current) =>
        current.filter((item) => item.id !== project.id)
      );
      setMessage("Project deleted.");
    } catch (err) {
      setError(err.message || "Unable to delete project.");
    }
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/admin", { replace: true });
  }

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>SHREYA'S PORTFOLIO</p>
          <h1 style={styles.heading}>Project dashboard</h1>
          <p style={styles.subheading}>
            Manage your portfolio projects in one place.
          </p>
        </div>

        <div style={styles.headerActions}>
          <Link to="/" style={styles.link}>View portfolio ↗</Link>
          <button onClick={handleSignOut} style={styles.secondaryButton}>
            Sign out
          </button>
        </div>
      </header>

      {error && <p role="alert" style={styles.error}>{error}</p>}
      {message && <p role="status" style={styles.success}>{message}</p>}
      <section style={styles.overview}>
  <article style={styles.statCard}>
    <span style={styles.statLabel}>TOTAL PROJECTS</span>
    <strong style={styles.statNumber}>{projects.length}</strong>
    <span style={styles.statDescription}>All your projects</span>
  </article>

  <article style={styles.statCard}>
    <span style={styles.statLabel}>PUBLISHED</span>
    <strong style={styles.statNumber}>{publishedCount}</strong>
    <span style={styles.statDescription}>Visible on your portfolio</span>
  </article>

  <article style={styles.statCard}>
    <span style={styles.statLabel}>DRAFTS</span>
    <strong style={styles.statNumber}>{draftCount}</strong>
    <span style={styles.statDescription}>Not yet published</span>
  </article>
</section>

<section style={styles.quickActions}>
  <p style={styles.quickActionsLabel}>QUICK ACCESS</p>

  <div style={styles.quickActionsLinks}>
    <a href="#add-project" style={styles.quickLink}>+ Add project</a>
    <a href="#project-list" style={styles.quickLink}>Manage projects ↗</a>
    <a href="#case-study-editor" style={styles.quickLink}>Case studies ↗</a>
    <a href="#flexible-block-editor" style={styles.quickLink}>Content editor ↗</a>
  </div>
</section>

      <section id="case-study-editor" style={styles.panel}>
  <h2>Case Study Editor</h2>
        <p style={styles.description}>
          Select a project to manage its case-study sections.
        </p>

        <label
          htmlFor="section-project"
          style={styles.label}
        >
          Select project
        </label>

        <select
          id="section-project"
          value={selectedProjectId}
          onChange={(event) => handleSelectSectionProject(event.target.value)}
          style={styles.input}
        >
          <option value="">Choose a project</option>
          {projects.map((project) => (
            <option key={project.id} value={String(project.id)}>
              {project.title}
            </option>
          ))}
        </select>

        {loadingSections && <p>Loading sections...</p>}

        {sectionError && (
          <p style={styles.error}>{sectionError}</p>
        )}

        {sectionMessage && (
          <p style={styles.success}>{sectionMessage}</p>
        )}
        
        {selectedProjectId && (
          <form
           onSubmit={editingSectionId ? handleUpdateSection : handleAddSection}
            style={{ marginTop: 24 }}
          >
            <h3>Add a case-study section</h3>

            <label style={styles.label} htmlFor="section-title">
              Section title
            </label>
            <input
              id="section-title"
              type="text"
              value={sectionForm.title}
              onChange={(event) =>
                setSectionForm({
                  ...sectionForm,
                  title: event.target.value,
                })
              }
              placeholder="e.g. The Problem"
              style={styles.input}
              required
              
            />
            
            <label style={styles.label} htmlFor="section-label">
              Section label
            </label>
            <input
              id="section-label"
              type="text"
              value={sectionForm.label}
              onChange={(event) =>
                setSectionForm({
                  ...sectionForm,
                  label: event.target.value,
                })
              }
              placeholder="e.g. THE PROBLEM"
              style={styles.input}
            />


            <label style={styles.label} htmlFor="section-body">
              Section content
            </label>
            <textarea
              id="section-body"
              value={sectionForm.body}
              onChange={(event) =>
                setSectionForm({
                  ...sectionForm,
                  body: event.target.value,
                })
              }
              placeholder="Explain this part of your case study..."
              style={styles.input}
              rows={5}
              required
            />

            <label style={styles.label} htmlFor="section-layout">
              Layout
            </label>
            <select
              id="section-layout"
              value={sectionForm.layout}
              onChange={(event) =>
                setSectionForm({
                  ...sectionForm,
                  layout: event.target.value,
                })
              }
              style={styles.input}
            >
              <option value="text">Text only</option>
              <option value="text-image">Text + image</option>
              <option value="image-text">Image + text</option>
              <option value="full-width-image">Full-width image</option>
              <option value="gallery">Image gallery</option>
            </select>

            <div style={styles.label}>
  <label htmlFor="section-image-upload">
    Upload images (you can select multiple)
  </label>
  <input
    id="section-image-upload"
    type="file"
    accept="image/png,image/jpeg,image/webp"
    multiple
    onChange={handleSectionImageUpload}
    disabled={uploadingSectionImages}
    style={styles.input}
  />
  {uploadingSectionImages && <p>Uploading images...</p>}

  {(sectionForm.image_urls || []).map((url, index) => (
    <div
      key={`${url}-${index}`}
      style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}
    >
      <img
        src={url}
        alt={`Section image ${index + 1}`}
        style={{ width: 110, height: 85, objectFit: "cover", borderRadius: 8 }}
      />
      <span>Image {index + 1}</span>
      <button
        type="button"
        style={styles.secondaryButton}
        disabled={index === 0}
        onClick={() => moveSectionImage(index, -1)}
      >
        Move left
      </button>
      <button
        type="button"
        style={styles.secondaryButton}
        disabled={index === sectionForm.image_urls.length - 1}
        onClick={() => moveSectionImage(index, 1)}
      >
        Move right
      </button>
      <button
        type="button"
        style={styles.deleteButton}
        onClick={() => removeSectionImage(index)}
      >
        Remove
      </button>
    </div>
  ))}
</div>

            <label style={styles.label} htmlFor="section-images">
              Image URLs (one per line)
            </label>
            <textarea
              id="section-images"
              value={sectionForm.image_urls.join("\n")}
              onChange={(event) =>
                setSectionForm({
                  ...sectionForm,
                  image_urls: event.target.value
                    .split("\n")
                    .map((url) => url.trim())
                    .filter(Boolean),
                })
              }
              placeholder={"https://example.com/image1.png\nhttps://example.com/image2.png"}
              style={styles.input}
              rows={3}
            />

            <label style={styles.label} htmlFor="section-order">
              Display order
            </label>
            <input
              id="section-order"
              type="number"
              min="0"
              value={sectionForm.display_order}
              onChange={(event) =>
                setSectionForm({
                  ...sectionForm,
                  display_order: event.target.value,
                })
              }
              style={styles.input}
            />

            <label style={styles.label} htmlFor="section-animation">
              Animation
            </label>
            <select
              id="section-animation"
              value={sectionForm.animation}
              onChange={(event) =>
                setSectionForm({
                  ...sectionForm,
                  animation: event.target.value,
                })
              }
              style={styles.input}
            >
              <option value="none">None</option>
              <option value="fade-up">Fade up</option>
              <option value="fade-in">Fade in</option>
              <option value="slide-left">Slide left</option>
              <option value="slide-right">Slide right</option>
            </select>
            
            <div style={{ marginTop: 30, marginBottom: 24 }}>
              <h3>Content Cards</h3>
              <p style={{ color: "#6B6B6B", fontSize: 14 }}>
                Add cards below your section description.
              </p>

              {(sectionForm.cards || []).map((card, index) => (
                <div
                  key={index}
                  style={{
                    padding: 20,
                    marginBottom: 16,
                    border: "1px solid #E5E5E5",
                    borderRadius: 12,
                  }}
                >
                  <h4>Card {index + 1}</h4>

                  <label style={styles.label}>
                    Card number
                  </label>
                  <input
                    type="text"
                    value={card.number || ""}
                    onChange={(event) =>
                      handleChangeCard(index, "number", event.target.value)
                    }
                    placeholder="01"
                    style={styles.input}
                  />

                  <label style={styles.label}>
                    Card title
                  </label>
                  <input
                    type="text"
                    value={card.title || ""}
                    onChange={(event) =>
                      handleChangeCard(index, "title", event.target.value)
                    }
                    placeholder="e.g. LIVE GPS LOCATION"
                    style={styles.input}
                  />

                  <label style={styles.label}>
                    Card description
                  </label>
                  <textarea
                    value={card.description || ""}
                    onChange={(event) =>
                      handleChangeCard(index, "description", event.target.value)
                    }
                    placeholder="Describe this card..."
                    style={styles.input}
                    rows={3}
                  />

                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={() => handleDeleteCard(index)}
                  >
                    Delete card
                  </button>
                </div>
              ))}

              <button
                type="button"
                style={styles.secondaryButton}
                onClick={handleAddCard}
              >
                + Add card
              </button>
            </div>


            
            <button
              type="submit"
              disabled={sectionSaving}
              style={styles.primaryButton}
            >
              {sectionSaving
                ? "Saving..."
                : editingSectionId
                  ? "Save changes"
                  : "Add section"}
            </button>

            {editingSectionId && (
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() => {
  setEditingSectionId(null);
  setSectionForm({ ...emptySection });
  setSectionError("");
  setSectionMessage("");
}}
              >
                Cancel editing
              </button>
            )}

          </form>
        )}

        {selectedProjectId && (
          <div style={{ marginTop: 24 }}>
            <h3>Existing sections ({sections.length})</h3>

            {loadingSections ? (
              <p>Loading sections...</p>
            ) : sections.length === 0 ? (
              <p style={styles.description}>
                No sections yet. You can add your first section next.
              </p>
            ) : (
              <div style={styles.projectList}>
                {sections.map((section) => (
                  <article key={section.id} style={styles.project}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ margin: "0 0 8px" }}>
                        {section.title || "Untitled section"}
                      </h4>

                      <p style={styles.description}>
                        Layout: {section.layout}
                      </p>

                      <p style={styles.status}>
                        Order {section.display_order}
                      </p>
                      <div style={styles.projectActions}>
  <button
    type="button"
    style={styles.secondaryButton}
    onClick={() => {
  handleEditSection(section);

  document.getElementById("case-study-editor")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}}
  >
    Edit
  </button>

  <button
    type="button"
    style={styles.deleteButton}
    onClick={() => handleDeleteSection(section)}
  >
    Delete
  </button>
</div>
                      
                      



                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

      </section>

      <section id="flexible-block-editor" style={styles.panel}>
  <h2>Flexible Block Editor</h2>
  <p style={styles.description}>
    Create and manage custom content blocks for your projects.
  </p>

  <label style={styles.label} htmlFor="block-project">
    Select Project
  </label>

  <select
    id="block-project"
    value={selectedBlockProjectId}
    onChange={(event) => handleSelectBlockProject(event.target.value)}
    style={styles.input}
  >
    <option value="">Choose a project</option>
    {projects.map((project) => (
      <option key={project.id} value={String(project.id)}>
        {project.title}
      </option>
    ))}
  </select>

  {blockError && (
    <p role="alert" style={styles.error}>{blockError}</p>
  )}

  {blockMessage && (
    <p role="status" style={styles.success}>{blockMessage}</p>
  )}

  {!selectedBlockProjectId ? (
    <p style={styles.description}>
      Select a project to manage its content blocks.
    </p>
  ) : (
    <>
      <div style={styles.form}>
        <h3>{editingBlockId ? "Edit Block" : "Add New Block"}</h3>

        <label style={styles.label} htmlFor="block-type">
          Block Type
        </label>

        <select
          id="block-type"
          value={blockForm.block_type}
          onChange={(event) =>
            setBlockForm((current) => ({
              ...current,
              block_type: event.target.value,
              content: {},
            }))
          }
          style={styles.input}
        >
          <option value="text">Text Section</option>
          <option value="image">Image</option>
          <option value="gallery">Gallery</option>
          <option value="video">Video</option>
          <option value="image-text">Image + Text</option>
          <option value="before-after">Before & After</option>
          <option value="feature-cards">Feature Cards</option>
          <option value="full-width-banner">Full-width Banner</option>
        </select>
        {["image", "gallery", "image-text", "before-after", "full-width-banner"].includes(blockForm.block_type) && (
  <div style={{ marginTop: 20, marginBottom: 20 }}>
    <label style={styles.label} htmlFor="block-image-width">
      Image size
    </label>

    <select
      id="block-image-width"
      value={[50, 75, 100].includes(Number(blockForm.content.imageWidth || 100))
        ? String(blockForm.content.imageWidth || 100)
        : "custom"}
      onChange={(event) =>
        setBlockForm((current) => ({
          ...current,
          content: {
            ...current.content,
            imageWidth: event.target.value === "custom"
              ? Number(current.content.imageWidth || 80)
              : Number(event.target.value),
          },
        }))
      }
      style={styles.input}
    >
      <option value="50">Small — 50%</option>
      <option value="75">Medium — 75%</option>
      <option value="100">Large — 100%</option>
      <option value="custom">Custom</option>
    </select>

    <label style={styles.label} htmlFor="block-custom-width">
      Custom width (%)
    </label>

    <input
      id="block-custom-width"
      type="number"
      min="10"
      max="100"
      value={blockForm.content.imageWidth || 100}
      onChange={(event) =>
        setBlockForm((current) => ({
          ...current,
          content: {
            ...current.content,
            imageWidth: Math.min(100, Math.max(10, Number(event.target.value))),
          },
        }))
      }
      style={styles.input}
    />
  </div>
)}
{["text", "image-text", "feature-cards", "full-width-banner"].includes(blockForm.block_type) && (
  <div style={styles.label}>
    <label htmlFor="block-heading">Heading</label>
    <input
      id="block-heading"
      value={blockForm.content.title || ""}
      onChange={(event) =>
        setBlockForm((current) => ({
          ...current,
          content: {
            ...current.content,
            title: event.target.value,
          },
        }))
      }
      style={styles.input}
      placeholder="Enter heading"
    />
  </div>
)}

{["text", "image-text", "feature-cards", "full-width-banner"].includes(blockForm.block_type) && (
  <div style={styles.label}>
    <label htmlFor="block-description">Description</label>
    <textarea
      id="block-description"
      value={blockForm.content.description || ""}
      onChange={(event) =>
        setBlockForm((current) => ({
          ...current,
          content: {
            ...current.content,
            description: event.target.value,
          },
        }))
      }
      style={styles.textarea}
      placeholder="Enter description"
      rows={4}
    />
  </div>
)}

       {["image", "gallery", "image-text", "full-width-banner"].includes(blockForm.block_type) && (
  <div style={styles.label}>
    <label htmlFor="block-image-upload">Upload images</label>
    <input
      id="block-image-upload"
      type="file"
      accept="image/png,image/jpeg,image/webp"
      multiple
      onChange={handleBlockImageUpload}
      disabled={uploadingBlockImages}
      style={styles.input}
    />

    {uploadingBlockImages && <p>Uploading...</p>}

    {(blockForm.content.imageUrls || (blockForm.content.imageUrl ? [blockForm.content.imageUrl] : [])).map((url, index, images) => (
      <div key={`${url}-${index}`} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        <img src={url} alt={`Image ${index + 1}`} style={{ width: 110, height: 85, objectFit: "cover", borderRadius: 8 }} />
        <span>Image {index + 1}</span>
        <button type="button" style={styles.secondaryButton} disabled={index === 0} onClick={() => moveBlockImage(index, -1)}>Move left</button>
        <button type="button" style={styles.secondaryButton} disabled={index === images.length - 1} onClick={() => moveBlockImage(index, 1)}>Move right</button>
        <button type="button" style={styles.deleteButton} onClick={() => removeBlockImage(index)}>Remove</button>
      </div>
    ))}
  </div>
)}

{blockForm.block_type === "gallery" && (
  <div style={styles.label}>
    <label htmlFor="block-gallery-images">Gallery Image URLs</label>
    <textarea
      id="block-gallery-images"
      value={(blockForm.content.imageUrls || []).join("\n")}
      onChange={(event) =>
        setBlockForm((current) => ({
          ...current,
          content: {
            ...current.content,
            imageUrls: event.target.value
              .split("\n")
              .map((url) => url.trim())
              .filter(Boolean),
          },
        }))
      }
      style={styles.textarea}
      placeholder="Enter one image URL per line"
      rows={5}
    />
  </div>
)}

{blockForm.block_type === "video" && (
  <div style={styles.label}>
    <label htmlFor="block-video-url">Video URL</label>
    <input
      id="block-video-url"
      value={blockForm.content.videoUrl || ""}
      onChange={(event) =>
        setBlockForm((current) => ({
          ...current,
          content: {
            ...current.content,
            videoUrl: event.target.value,
          },
        }))
      }
      style={styles.input}
      placeholder="Enter video URL"
    />
  </div>
)}

{blockForm.block_type === "before-after" && (
  <>
    <div style={styles.label}>
      <label htmlFor="before-image-upload">Upload Before Image</label>
<input
  id="before-image-upload"
  data-target="beforeImageUrl"
  type="file"
  accept="image/png,image/jpeg,image/webp"
  onChange={handleBlockImageUpload}
  style={styles.input}
/>
    </div>

    <div style={styles.label}>
      <label htmlFor="after-image-upload">Upload After Image</label>
<input
  id="after-image-upload"
  data-target="afterImageUrl"
  type="file"
  accept="image/png,image/jpeg,image/webp"
  onChange={handleBlockImageUpload}
  style={styles.input}
/>
    </div>
  </>
)}

{blockForm.block_type === "feature-cards" && (
  <div style={styles.label}>
    <label htmlFor="block-feature-cards">Feature Cards</label>
    <textarea
      id="block-feature-cards"
      value={(blockForm.content.cards || [])
        .map((card) => `${card.title}|${card.description}`)
        .join("\n")}
      onChange={(event) =>
        setBlockForm((current) => ({
          ...current,
          content: {
            ...current.content,
            cards: event.target.value.split("\n").map((line) => {
              const [title = "", ...description] = line.split("|");
              return {
                title: title.trim(),
                description: description.join("|").trim(),
              };
            }),
          },
        }))
      }
      style={styles.textarea}
      placeholder={"Enter one card per line:\nTitle | Description"}
      rows={5}
    />
  </div>
)}

<div style={styles.label}>
  <label htmlFor="block-display-order">
    Display Order
  </label>

  <input
    id="block-display-order"
    type="number"
    value={blockForm.display_order}
    onChange={(event) =>
      setBlockForm((current) => ({
        ...current,
        display_order: event.target.value,
      }))
    }
    style={styles.input}
    placeholder="Enter display order"
  />
</div>

       <label style={styles.checkboxLabel}>
  <input
    type="checkbox"
    checked={blockForm.is_visible}
    onChange={(event) =>
      setBlockForm((current) => ({
        ...current,
        is_visible: event.target.checked,
      }))
    }
  />
  Visible on project page
</label>

        <div style={styles.buttonRow}>
          <button
            type="button"
            style={styles.primaryButton}
            disabled={blockSaving}
            onClick={() =>
              editingBlockId
                ? handleUpdateBlock(editingBlockId)
                : handleAddBlock()
            }
          >
            {blockSaving
              ? "Saving..."
              : editingBlockId
                ? "Save Changes"
                : "Add Block"}
          </button>
        

          {editingBlockId && (
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={() => {
  setEditingBlockId(null);
  setBlockForm({ ...emptyBlock });
  setBlockError("");
  setBlockMessage("");
}}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div style={styles.list}>
        <h3>Existing Content Blocks</h3>

        {loadingBlocks ? (
          <p>Loading blocks...</p>
        ) : blocks.length === 0 ? (
          <p style={styles.description}>
            No content blocks added yet.
          </p>
        ) : (
          blocks.map((block, index) => (
            <article key={block.id} style={styles.listItem}>
              <div>
                <h4>{block.content?.title || block.block_type}</h4>
                <p style={styles.description}>
                  {block.block_type} · Order: {block.display_order}
                  · {block.is_visible ? "Visible" : "Hidden"}
                </p>
              </div>

              <button
  type="button"
  style={styles.secondaryButton}
  disabled={blockSaving || index === 0}
  onClick={() => handleMoveBlock(block, -1)}
>
  ↑ Move Up
</button>

<button
  type="button"
  style={styles.secondaryButton}
  disabled={blockSaving || index === blocks.length - 1}
  onClick={() => handleMoveBlock(block, 1)}
>
  ↓ Move Down
</button>

              <div style={styles.buttonRow}>
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={() => {
  setEditingBlockId(block.id);
  setBlockForm({
    block_type: block.block_type,
    content: block.content || {},
    display_order: block.display_order,
    is_visible: block.is_visible,
  });
  setBlockError("");
  setBlockMessage("");

  document.getElementById("flexible-block-editor")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}}
                >
                  Edit
                </button>

                <button
                  type="button"
                  style={styles.deleteButton}
                  disabled={blockSaving}
                  onClick={() => handleDeleteBlock(block)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </>
  )}
</section>


      <section id="add-project" style={styles.panel}>
  <h2>Add a project</h2>

        <form onSubmit={handleAddProject} style={styles.form}>
          <label style={styles.label}>
            Project title *
            <input
              name="title"
              value={form.title}
              onChange={updateField}
              required
              maxLength={200}
              style={styles.input}
              placeholder="e.g. DinePoint"
            />
          </label>

          <label style={styles.label}>
            Description *
            <textarea
              name="description"
              value={form.description}
              onChange={updateField}
              required
              maxLength={5000}
              rows={4}
              style={styles.input}
              placeholder="Describe your project..."
            />
          </label>

          
  <div style={styles.label}>
    <label htmlFor="project-image">
      Project image (PNG, JPG, or WebP · max 5 MB)
    </label>

    <input
      id="project-image"
      type="file"
      accept="image/png,image/jpeg,image/webp"
      onChange={handleImageUpload}
      disabled={uploadingImage}
      style={styles.input}
    />

    {uploadingImage && <p>Uploading image...</p>}

    {form.image_url && (
      <div>
        <img
          src={form.image_url}
          alt="Project preview"
          style={styles.imagePreview}
        />

        <button
          type="button"
          onClick={() =>
            setForm((current) => ({
              ...current,
              image_url: "",
            }))
          }
          style={styles.secondaryButton}
        >
          Remove image
        </button>
      </div>
    )}

    <label htmlFor="image-url-fallback">
      Or enter an existing image URL
    </label>

    <input
      id="image-url-fallback"
      name="image_url"
      type="url"
      value={form.image_url}
      onChange={updateField}
      style={styles.input}
      placeholder="https://..."
    />
  </div>


          <label style={styles.label}>
            Live project URL
            <input
              name="project_url"
              type="url"
              value={form.project_url}
              onChange={updateField}
              style={styles.input}
              placeholder="https://..."
            />
          </label>

          <label style={styles.label}>
            GitHub URL
            <input
              name="github_url"
              type="url"
              value={form.github_url}
              onChange={updateField}
              style={styles.input}
              placeholder="https://github.com/..."
            />
          </label>

          <label style={styles.label}>
            Technologies (comma-separated)
            <input
              name="technologies"
              value={form.technologies}
              onChange={updateField}
              style={styles.input}
              placeholder="React, CSS, Supabase"
            />
          </label>

          <label style={styles.label}>
            Display order
            <input
              name="display_order"
              type="number"
              min="0"
              max="100000"
              value={form.display_order}
              onChange={updateField}
              style={styles.input}
            />
          </label>

          <label style={styles.checkboxLabel}>
            <input
              name="is_published"
              type="checkbox"
              checked={form.is_published}
              onChange={updateField}
            />
            Publish immediately
          </label>

          <button type="submit" disabled={saving} style={styles.primaryButton}>
            {saving ? "Saving..." : "Add project"}
          </button>
        </form>
      </section>

      <section id="project-list" style={styles.panel}>
        <div style={styles.listHeader}>
          <h2>Your projects ({projects.length})</h2>
          <button onClick={loadProjects} style={styles.secondaryButton}>
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p>No projects found yet.</p>
        ) : (
          <div style={styles.projectList}>
            {projects.map((project) => (
  <article key={project.id} style={styles.project}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <h3 style={{ margin: "0 0 8px" }}>{project.title}</h3>
      <p style={styles.description}>{project.description}</p>
      <p style={styles.status}>
        {project.is_published ? "Published" : "Draft"}
        {" · "}
        Order {project.display_order}
      </p>
    </div>

    <div style={styles.projectActions}>
      <button
        type="button"
        style={styles.secondaryButton}
        onClick={() => togglePublished(project)}
      >
        {project.is_published ? "Unpublish" : "Publish"}
      </button>

      <button
        type="button"
        style={styles.deleteButton}
        onClick={() => deleteProject(project)}
      >
        Delete
      </button>
    </div>
  </article>
))}
          </div>
        )}
      </section>
    </main>
  );
}
const styles = {
  page: {
    minHeight: "100vh",
    padding: "clamp(20px, 5vw, 64px)",
    background: "#f7f5f0",
    color: "#252525",
    fontFamily: "inherit",
  },
  header: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "32px",
  },
  eyebrow: { fontSize: "12px", letterSpacing: "2px" },
  heading: { fontSize: "clamp(28px, 4vw, 40px)", margin: "8px 0" },
  subheading: { color: "#666" },
  headerActions: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "12px",
  },
  link: { color: "#252525" },
  panel: {
    background: "#fff",
    border: "1px solid #e5e1d9",
    borderRadius: "16px",
    padding: "clamp(18px, 3vw, 32px)",
    marginBottom: "24px",
  },
 form: {
  display: "flex",
  flexDirection: "column",
  gap: "18px",
  marginTop: "20px",
},
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #d5d0c8",
    borderRadius: "8px",
    background: "#fff",
    color: "#252525",
    font: "inherit",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
  },
  primaryButton: {
    padding: "13px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#252525",
    color: "#fff",
    cursor: "pointer",
    font: "inherit",
  },
  secondaryButton: {
    padding: "10px 14px",
    border: "1px solid #d5d0c8",
    borderRadius: "8px",
    background: "#fff",
    color: "#252525",
    cursor: "pointer",
    font: "inherit",
  },
  deleteButton: {
    padding: "10px 14px",
    border: "1px solid #e4b8b5",
    borderRadius: "8px",
    background: "#fff",
    color: "#b42318",
    cursor: "pointer",
    font: "inherit",
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  projectList: { display: "grid", gap: "12px", marginTop: "18px" },
  project: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "18px",
    padding: "18px 0",
    borderTop: "1px solid #eee9e1",
  },
  description: { color: "#666", margin: "0 0 8px", overflowWrap: "anywhere" },
  status: { fontSize: "13px", color: "#666", margin: 0 },
  projectActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  imagePreview: {
  display: "block",
  width: "100%",
  maxWidth: "320px",
  maxHeight: "220px",
  objectFit: "contain",
  objectPosition: "left center",
  marginTop: "12px",
  marginBottom: "12px",
  borderRadius: "10px",
  border: "1px solid #e5e1d9",
  background: "#f7f5f0",
},
  error: { color: "#b42318", marginBottom: "16px" },
  success: { color: "#167344", marginBottom: "16px" },
  
overview: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "16px",
  marginBottom: "24px",
},

statCard: {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  padding: "24px",
  background: "#fff",
  border: "1px solid #e5e1d9",
  borderRadius: "16px",
},

statLabel: {
  color: "#77766f",
  fontSize: "11px",
  letterSpacing: "1.5px",
},

statNumber: {
  fontSize: "36px",
  fontWeight: "500",
  lineHeight: 1,
},

statDescription: {
  color: "#77766f",
  fontSize: "13px",
},

quickActions: {
  padding: "22px 24px",
  marginBottom: "24px",
  background: "#eeede7",
  border: "1px solid #e5e1d9",
  borderRadius: "16px",
},

quickActionsLabel: {
  fontSize: "11px",
  letterSpacing: "1.5px",
  color: "#77766f",
  marginTop: 0,
  marginBottom: "16px",
},

quickActionsLinks: {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
},

quickLink: {
  color: "#252525",
  textDecoration: "none",
  fontSize: "13px",
  padding: "10px 14px",
  background: "#fff",
  border: "1px solid #deddd6",
  borderRadius: "8px",
  transition: "all 0.2s ease",
},
};

