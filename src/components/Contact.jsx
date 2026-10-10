
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
        "http://localhost:5000/api/contact",
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
        >
          Email ↗
        </a>

        <a
          href="https://github.com/vishreyko1215"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub ↗
        </a>

        <a
          href="https://www.linkedin.com/in/shreya-mirajkar-87bb342a5"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn ↗
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
