
import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
       "https://shreya-portfolio-mrun.onrender.com/api/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong.");
      }

      setStatus("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setStatus(
        error.message || "Unable to send your message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="contact" className="contact-section">
      <p className="section-label">GET IN TOUCH</p>

      <h2>Have an idea in mind?</h2>

      <p className="contact-description">
        I'm always open to interesting projects,
        creative collaborations and new opportunities.
      </p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your name"
          value={formData.name}
          onChange={handleChange}
          required
          maxLength={100}
        />

        <input
          type="email"
          name="email"
          placeholder="Your email"
          value={formData.email}
          onChange={handleChange}
          required
          maxLength={254}
        />

        <textarea
          name="message"
          placeholder="Tell me about your idea..."
          value={formData.message}
          onChange={handleChange}
          required
          maxLength={5000}
          rows={5}
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send message ↗"}
        </button>

        {status && (
          <p role="status" aria-live="polite">
            {status}
          </p>
        )}
      </form>

      <div className="contact-links">
  <a
    href="https://mail.google.com/mail/?view=cm&fs=1&to=shreyamirajkar.05@gmail.com"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Email Shreya"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 5h18v14H3z" />
      <path d="m3 6 9 7 9-7" />
    </svg>
    <span>Email</span>
  </a>

  <a
    href="https://github.com/vishreyko1215"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="GitHub profile"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.3-1.24-1.65-1.24-1.65-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.6 1.21 3.23.92.1-.72.39-1.21.7-1.49-2.47-.28-5.07-1.24-5.07-5.5 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.56 0c2.12-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.27-2.6 5.21-5.08 5.49.4.35.75 1.02.75 2.06v3.07c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
    </svg>
    <span>GitHub</span>
  </a>

  <a
    href="https://www.linkedin.com/in/shreya-mirajkar-87bb342a5"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="LinkedIn profile"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M5.2 3.2a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4ZM3.3 9h3.8v12H3.3V9Zm6.2 0h3.6v1.64h.05A3.96 3.96 0 0 1 16.7 8.7c3.84 0 4.55 2.53 4.55 5.82V21h-3.8v-5.75c0-1.37-.03-3.13-1.9-3.13-1.9 0-2.2 1.49-2.2 3.03V21H9.5V9Z" />
    </svg>
    <span>LinkedIn</span>
  </a>
</div>

      <footer className="portfolio-footer">
        Designed &amp; built by Shreya.
        <span>© 2026</span>
      </footer>
    </section>
  );
}

export default Contact;
