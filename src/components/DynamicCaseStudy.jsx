
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function DynamicCaseStudy() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProject() {
      try {
        const [projectResponse, blocksResponse, sectionsResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/projects/${projectId}`),
            fetch(`${API_URL}/api/projects/${projectId}/blocks`),
            fetch(`${API_URL}/api/projects/${projectId}/sections`),
          ]);

        if (!projectResponse.ok) throw new Error("Unable to load project.");
        if (!blocksResponse.ok) throw new Error("Unable to load project blocks.");

        const projectResult = await projectResponse.json();
        const blocksResult = await blocksResponse.json();

        let sectionsResult = { sections: [] };

        if (sectionsResponse.ok) {
          sectionsResult = await sectionsResponse.json();
        }

        if (!cancelled) {
          setProject(projectResult.project);
          setBlocks(blocksResult.blocks || []);
          setSections(sectionsResult.sections || []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (loading) return <p>Loading project...</p>;
  if (error) return <p>{error}</p>;
  if (!project) return <p>Project not found.</p>;

  const isInteriorDesign = project.title?.toLowerCase().includes("interior");

  const cardStyle = {
    background: "#FFFFFF",
    padding: "24px",
    borderRadius: "20px",
    boxShadow: "0 8px 35px rgba(0,0,0,0.045)",
    boxSizing: "border-box",
    width: "100%",
    maxWidth: "1200px",
    margin: "24px auto",
  };

  const imageStyle = {
    display: "block",
    width: "100%",
    height: "auto",
    objectFit: "contain",
    borderRadius: "12px",
  };

  const contentItems = [
    ...(isInteriorDesign
      ? sections.map((section) => ({
          ...section,
          contentKind: "section",
        }))
      : []),
    ...blocks
      .filter((block) => block.is_visible !== false)
      .map((block) => ({
        ...block,
        contentKind: "block",
      })),
  ].sort(
    (a, b) => Number(a.display_order || 0) - Number(b.display_order || 0)
  );

  return (
    <main className="dynamic-case-study-page">
      <h1>{project.title}</h1>
      <p>{project.description}</p>

      <div
        className="dynamic-case-study-content"
        style={{
          width: "100%",
          maxWidth: "1248px",
          margin: "0 auto",
          padding: "0",
          boxSizing: "border-box",
        }}
      >
        {contentItems.map((item) => {
          if (item.contentKind === "section") {
            const images = item.image_urls || [];

            return (
              <section
  key={`section-${item.id}`}
  className={`case-study-section ${item.layout || "text"}`}
  style={{
    width: "100%",
    maxWidth: "none",
    margin: "30px 0",
    padding: "0",
    boxSizing: "border-box",
  }}
>
                {item.label && <p className="case-study-label">{item.label}</p>}
                {item.title && <h2>{item.title}</h2>}

                {item.layout === "text" && (
                  <div style={cardStyle}>
                    <p>{item.body}</p>
                  </div>
                )}

                {item.layout === "text-image" && (
                  <div style={cardStyle}>
                    <p>{item.body}</p>
                    {images.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`${item.title || "Section image"} ${index + 1}`}
                        style={{ ...imageStyle, marginTop: "20px" }}
                      />
                    ))}
                  </div>
                )}

                {item.layout === "image-text" && (
                  <div style={cardStyle}>
                    {images.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`${item.title || "Section image"} ${index + 1}`}
                        style={{ ...imageStyle, marginBottom: "20px" }}
                      />
                    ))}
                    <p>{item.body}</p>
                  </div>
                )}

                {item.layout === "full-width-image" && (
                  <div>
                    {images.map((url, index) => (
                      <div key={index} style={cardStyle}>
                        <img
                          src={url}
                          alt={`${item.title || "Section image"} ${index + 1}`}
                          style={imageStyle}
                        />
                      </div>
                    ))}
                    {item.body && <p>{item.body}</p>}
                  </div>
                )}

                {item.layout === "gallery" && (
                  <div style={cardStyle}>
                    <p>{item.body}</p>
                    <div className="dynamic-gallery-grid">
                      {images.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Gallery ${index + 1}`}
                          style={imageStyle}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          }

          const content = item.content || {};
          const images = content.imageUrls?.length
            ? content.imageUrls
            : content.imageUrl
              ? [content.imageUrl]
              : [];

          const imageWidth = Math.min(
            100,
            Math.max(10, Number(content.imageWidth) || 100)
          );

          const sizedCard = {
            ...cardStyle,
            width: `${imageWidth}%`,
          };

          switch (item.block_type) {
            case "text":
              return (
                <section key={`block-${item.id}`} className="dynamic-block dynamic-block-text">
                  {content.title && <h2>{content.title}</h2>}
                  {content.description && <p>{content.description}</p>}
                </section>
              );

            case "image":
              return (
                <section key={`block-${item.id}`} className="dynamic-block dynamic-block-image">
                  {content.title && <h2>{content.title}</h2>}
                  {images.map((url, index) => (
                    <div key={index} style={sizedCard}>
                      <img src={url} alt={`${content.title || "Project image"} ${index + 1}`} style={imageStyle} />
                    </div>
                  ))}
                </section>
              );

            case "gallery":
              return (
                <section key={`block-${item.id}`} className="dynamic-block dynamic-block-gallery">
                  {content.title && <h2>{content.title}</h2>}
                  <div style={sizedCard}>
                    <div className="dynamic-gallery-grid">
                      {images.map((url, index) => (
                        <img key={index} src={url} alt={`Gallery ${index + 1}`} style={imageStyle} />
                      ))}
                    </div>
                  </div>
                </section>
              );

            case "video":
              return (
                <section key={`block-${item.id}`} className="dynamic-block dynamic-block-video">
                  {content.title && <h2>{content.title}</h2>}
                  {content.videoUrl && <video src={content.videoUrl} controls />}
                </section>
              );

            case "image-text":
              return (
                <section key={`block-${item.id}`} className="dynamic-block dynamic-block-image-text">
                  {content.title && <h2>{content.title}</h2>}
                  {content.description && <p>{content.description}</p>}
                  {images.map((url, index) => (
                    <div key={index} style={sizedCard}>
                      <img src={url} alt={`${content.title || "Project image"} ${index + 1}`} style={imageStyle} />
                    </div>
                  ))}
                </section>
              );

            case "before-after":
              return (
                <section key={`block-${item.id}`} className="dynamic-block dynamic-block-before-after">
                  <div style={sizedCard}>
                    <div className="dynamic-before-after-grid">
                      {content.beforeImageUrl && (
                        <img src={content.beforeImageUrl} alt="Before" style={imageStyle} />
                      )}
                      {content.afterImageUrl && (
                        <img src={content.afterImageUrl} alt="After" style={imageStyle} />
                      )}
                    </div>
                  </div>
                </section>
              );

            case "feature-cards":
              return (
                <section key={`block-${item.id}`} className="dynamic-block dynamic-block-feature-cards">
                  {content.title && <h2>{content.title}</h2>}
                  {content.description && <p>{content.description}</p>}
                  <div>
                    {(content.cards || []).map((card, index) => (
                      <div key={index}>
                        {card.imageUrl && <img src={card.imageUrl} alt={card.title || "Feature"} />}
                        <h3>{card.title}</h3>
                        <p>{card.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "full-width-banner":
              return (
                <section key={`block-${item.id}`} className="dynamic-block dynamic-block-full-width-banner">
                  {images.map((url, index) => (
                    <div key={index} style={sizedCard}>
                      <img src={url} alt={`${content.title || "Project banner"} ${index + 1}`} style={imageStyle} />
                    </div>
                  ))}
                  {content.title && <h2>{content.title}</h2>}
                  {content.description && <p>{content.description}</p>}
                </section>
              );

            default:
              return null;
          }
        })}
      </div>
    </main>
  );
}

export default DynamicCaseStudy;
