
import ProjectCard from "./ProjectCard"

function SelectedWork() {
  return (
    <section className="work-section" id="work">
      <p className="section-label">SELECTED WORK</p>

      <ProjectCard
        number="01"
        title="DinePoint"
        description="Finding a convenient place to eat when everyone's coming from different places."
        tags={["Mobile", "Product", "Flutter"]}
        image="/assets/hero-midpoint.png"
        caseStudyLink="/dinepoint"
        githubLink="https://github.com/vishreyko1215/DinePoint"
      />

      <ProjectCard
        number="02"
        title="BMSCE Events Portal"
        description="A centralized platform for discovering college events and club activities."
        tags={["Web", "Frontend", "UI"]}
        image="/assets/hero-events.png"
        caseStudyLink="/bmsce"
        githubLink="https://github.com/vishreyko1215/BMSCE-Events-Portal"
      />
    </section>
  )
}

export default SelectedWork
