
import { useEffect, useState } from "react"
import API_URL from "../config"
import ProjectCard from "./ProjectCard"

const existingProjects = [
  {
    title: "DinePoint",
    description: "Finding a convenient place to eat when everyone's coming from different places.",
    tags: ["Mobile", "Product", "Flutter"],
    image: "/assets/hero-midpoint.png",
    caseStudyLink: "/dinepoint",
    githubLink: "https://github.com/vishreyko1215/DinePoint",
  },
  {
    title: "BMSCE Events Portal",
    description: "A centralized platform for discovering college events and club activities.",
    tags: ["Web", "Frontend", "UI"],
    image: "/assets/hero-events.png",
    caseStudyLink: "/bmsce",
    githubLink: "https://github.com/vishreyko1215/BMSCE-Events-Portal",
  },
]

function SelectedWork() {
  const [projects, setProjects] = useState(existingProjects)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch(`${API_URL}/api/projects`)

        if (!response.ok) {
          throw new Error("Unable to load projects")
        }

        const result = await response.json()
        const databaseProjects = result.projects || []

        const formattedProjects = databaseProjects.map((project) => {
          const title = project.title?.toLowerCase() || ""

          const existingProject = existingProjects.find(
            (item) => item.title.toLowerCase() === title
          )

          return {
            number: "",
            title: project.title,
            description: project.description || "",
            tags: project.technologies || [],
            image: project.image_url || existingProject?.image || "",
            caseStudyLink:
              existingProject?.caseStudyLink || `/project/${project.id}`,
            githubLink:
              project.github_url || existingProject?.githubLink || "",
            displayOrder: project.display_order,
          }
        })

        const databaseTitles = formattedProjects.map(
          (project) => project.title.toLowerCase()
        )

        const missingExistingProjects = existingProjects.filter(
          (project) =>
            !databaseTitles.includes(project.title.toLowerCase())
        )

        const allProjects = [
          ...formattedProjects,
          ...missingExistingProjects,
        ]

        allProjects.sort((a, b) => {
          const orderA = a.displayOrder ?? 999999
          const orderB = b.displayOrder ?? 999999
          return orderA - orderB
        })

        setProjects(
          allProjects.map((project, index) => ({
            ...project,
            number: String(index + 1).padStart(2, "0"),
          }))
        )
      } catch (error) {
        console.error("Unable to load projects:", error)
      }
    }

    loadProjects()
  }, [])

  return (
    <section className="work-section" id="work">
      <p className="section-label">SELECTED WORK</p>

      {projects.map((project) => (
        <ProjectCard key={project.title} {...project} />
      ))}
    </section>
  )
}

export default SelectedWork
