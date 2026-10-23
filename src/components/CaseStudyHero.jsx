
function CaseStudyHero({
  category,
  title,
  intro,
  role,
  technology,
  year,
  image,
  imageAlt,
}) {
  return (
    <section className="case-study-hero">
      <p className="section-label">{category}</p>

      <h1>{title}</h1>

      <p className="case-study-intro">{intro}</p>

      <div className="case-study-meta">
        <div>
          <span>ROLE</span>
          <strong>{role}</strong>
        </div>

        <div>
          <span>TECHNOLOGY</span>
          <strong>{technology}</strong>
        </div>

        <div>
          <span>YEAR</span>
          <strong>{year}</strong>
        </div>
      </div>

      <div className="case-study-image">
        <img src={image} alt={imageAlt} />
      </div>
    </section>
  )
}

export default CaseStudyHero
