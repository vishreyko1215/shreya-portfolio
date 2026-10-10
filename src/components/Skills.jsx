
function Skills() {
  const skillGroups = [
    {
      title: "DESIGN",
      skills: ["UI/UX Design", "Wireframing", "Prototyping", "Figma"],
    },
    {
      title: "DEVELOPMENT",
      skills: ["HTML", "CSS", "JavaScript", "React", "Flutter", "Dart"],
    },
    {
      title: "TOOLS & CONCEPTS",
      skills: ["GitHub", "Responsive Design", "OpenStreetMap", "REST APIs"],
    },
  ]

  return (
    <section className="skills-section" id="skills">
      <p className="section-label">WHAT I WORK WITH</p>

      <h2>Skills & tools</h2>

      <div className="skills-grid">
        {skillGroups.map((group) => (
          <div className="skill-group" key={group.title}>
            <h3>{group.title}</h3>

            <div className="skill-list">
              {group.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Skills
