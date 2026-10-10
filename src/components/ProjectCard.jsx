function ProjectCard({ number, title, description, tags, image, caseStudyLink, githubLink }) {
  return (
    <div className="project-card">

      <div className="project-info">
        <div className="project-number">
          {number}
        </div>

        <h2>{title}</h2>

        <p className="project-description">
          {description}
        </p>

        <div className="project-tags">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        <a href={caseStudyLink} className="project-link">
          View case study →
        </a>

        <a
          href={githubLink}
          className="project-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          View GitHub →
        </a>
      </div>

      <div className="project-image">
        <img src={image} alt={title} />
      </div>

    </div>
  )
}

export default ProjectCard