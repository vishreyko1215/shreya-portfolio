
function DinePointCaseStudy() {
  return (
    <main className="case-study">
      <section className="case-study-hero">
        <p className="section-label">
          MOBILE · PRODUCT · FLUTTER
        </p>

        <h1>DinePoint</h1>

        <p className="case-study-intro">
          Finding a convenient place to eat when
          everyone's coming from different places.
        </p>

        <div className="case-study-meta">
          <div>
            <span>ROLE</span>
            <strong>Frontend · UI Implementation</strong>
          </div>

          <div>
            <span>TECHNOLOGY</span>
            <strong>Flutter · Dart · OpenStreetMap</strong>
          </div>

          <div>
            <span>YEAR</span>
            <strong>2026</strong>
          </div>
        </div>

        <div className="case-study-image">
          <img
            src="/assets/hero-midpoint.png"
            alt="DinePoint midpoint feature interface"
          />
        </div>
        
      </section>

      
      {/* Overview */}
      <section className="case-study-section">
        <div className="case-study-label">
          OVERVIEW
        </div>

        <div className="overview-grid">
          <div>
            <h2>
              A restaurant discovery app built around
              convenient meeting points.
            </h2>

            <p>
              DinePoint helps users discover restaurants based on
              location and provides a midpoint feature for finding
              convenient places to eat when people are coming from
              different locations.
            </p>
          </div>

          <div className="overview-details">
            <div>
              <span>ROLE</span>
              <p>Frontend · UI Implementation</p>
            </div>

            <div>
              <span>TECHNOLOGY</span>
              <p>Flutter · Dart · OpenStreetMap</p>
            </div>

            <div>
              <span>YEAR</span>
              <p>2026</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="case-study-section problem-section">
        <p className="section-label">THE PROBLEM</p>

        <div className="case-study-content">
          <h2>
            Where should everyone meet when they're
            starting from different places?
          </h2>

          <p>
            Choosing a restaurant can become difficult when
            everyone is travelling from different locations.
            DinePoint addresses this by helping users find
            a convenient midpoint and explore restaurants
            around that area.
          </p>
        </div>

        <div className="problem-flow">
          <div>LOCATION A</div>
          <span>+</span>
          <div>LOCATION B</div>
          <span>→</span>
          <div className="problem-highlight">MIDPOINT</div>
          <span>→</span>
          <div>RESTAURANTS</div>
        </div>
      </section>
      
      {/* Solution */}
      <section className="case-study-section">
        <p className="section-label">THE SOLUTION</p>

        <div className="case-study-content">
          <h2>
            Find a meeting point, then discover
            restaurants around it.
          </h2>

          <p>
            DinePoint combines location-based restaurant
            discovery with a midpoint feature to help
            people find a convenient place to eat together.
          </p>
        </div>

        <div className="solution-flow">
          {[
            ["01", "Choose locations"],
            ["02", "Calculate midpoint"],
            ["03", "Explore restaurants"],
            ["04", "Choose a place"],
          ].map(([number, label]) => (
            <div className="solution-step" key={number}>
              <span>{number}</span>
              <strong>{label}</strong>
            </div>
          ))}
        </div>
      </section>
     
      {/* User Flow */}
      <section className="case-study-section user-flow-section">
        <div className="case-study-label">
          USER FLOW
        </div>

        <div className="case-study-content">
          <h2>
            A simple flow from searching to discovering a
            place to eat.
          </h2>

          <p>
            The experience guides users from searching for a
            location to finding a midpoint, exploring restaurants
            and choosing what works best for them.
          </p>
        </div>

        <div className="user-flow">
          <div className="flow-step">
            <span>01</span>
            <strong>SEARCH</strong>
          </div>

          <div className="flow-arrow">→</div>

          <div className="flow-step">
            <span>02</span>
            <strong>FILTER</strong>
          </div>

          <div className="flow-arrow">→</div>

          <div className="flow-step">
            <span>03</span>
            <strong>FIND MIDPOINT</strong>
          </div>

          <div className="flow-arrow">→</div>

          <div className="flow-step">
            <span>04</span>
            <strong>EXPLORE RESTAURANT</strong>
          </div>

          <div className="flow-arrow">→</div>

          <div className="flow-step">
            <span>05</span>
            <strong>SAVE / NAVIGATE</strong>
          </div>
        </div>
      </section>


      {/* Interface Gallery */}
      <section className="case-study-section">
        <p className="section-label">THE INTERFACE</p>

        <div className="case-study-content">
          <h2>
            Designed around restaurant discovery.
          </h2>

          <p>
            Search, filtering, restaurant details and
            favourites help users explore options and
            decide where to eat.
          </p>
        </div>

        <div className="interface-gallery">
          {[
            {
              image: "/assets/home.png",
              title: "Discover",
              description: "Explore restaurant options.",
            },
            {
              image: "/assets/filters.png",
              title: "Filter",
              description: "Narrow down the choices.",
            },
            {
              image: "/assets/restaurant-detail.png",
              title: "Explore details",
              description: "View information about a restaurant.",
            },
            {
              image: "/assets/favourites.png",
              title: "Save favourites",
              description: "Keep track of saved restaurants.",
            },
          ].map((screen) => (
            <article className="interface-card" key={screen.title}>
              <div className="interface-screen">
                <img src={screen.image} alt={`${screen.title} screen`} />
              </div>

              <h3>{screen.title}</h3>
              <p>{screen.description}</p>
            </article>
          ))}
        </div>
      </section>

      
      {/* Midpoint Feature */}
      <section className="case-study-section midpoint-section">
        <p className="section-label">THE MIDPOINT FEATURE</p>

        <div className="case-study-content">
          <h2>
            Bringing different starting points together.
          </h2>

          <p>
            The midpoint feature helps users identify a
            central meeting location between two starting
            points and explore restaurants around that area.
            Users can also share the calculated midpoint
            to coordinate where to meet.
          </p>
        </div>

        {/* Main midpoint image */}
        <div className="midpoint-main-image">
          <img
            src="/assets/hero-midpoint.png"
            alt="DinePoint midpoint feature"
          />
        </div>

        {/* Share midpoint feature */}
        <div className="midpoint-share">
          <div className="midpoint-secondary-image">
            <img
              src="/assets/share-midpoint.png"
              alt="DinePoint share midpoint screen"
            />
          </div>

          <div className="midpoint-share-content">
            <p className="section-label">SHARE THE MIDPOINT</p>

            <p>
              Users can share the calculated midpoint with
              others, making it easier to coordinate where to
              meet.
            </p>
          </div>
        </div>
      </section>

      {/* Maps & Location */}
      <section className="case-study-section maps-section">
        <p className="section-label">MAPS & LOCATION</p>

        <div className="case-study-content">
          <h2>
            Exploring restaurants through maps and location.
          </h2>

          <p>
            DinePoint uses OpenStreetMap to display locations
            and help users explore restaurants around the
            calculated midpoint. Location and map integration
            make it easier to understand where places are
            and choose a convenient meeting point.
          </p>
        </div>

        <div className="maps-image">
          <img
            src="/assets/map.png"
            alt="DinePoint map and restaurant locations"
          />
        </div>
      </section>


      {/* Technology */}
      <section className="case-study-section">
        <p className="section-label">TECHNOLOGY</p>

        <div className="case-study-content">
          <h2>Turning the idea into a working application.</h2>

          <p>
            DinePoint uses Flutter and Dart for its mobile
            interface, OpenStreetMap for map visualization,
            Nominatim for geocoding, and local JSON data
            for restaurant information.
          </p>
        </div>

        <div className="technology-grid">
          {[
            ["01", "Flutter", "Cross-platform app framework."],
            ["02", "Dart", "Language used to build the app."],
            ["03", "OpenStreetMap", "Map data and visualization."],
            ["04", "Nominatim", "Geocoding and location search."],
            ["05", "JSON", "Local restaurant data."],
            ["06", "SharedPreferences", "Persistence for saved preferences."],
          ].map(([number, title, description]) => (
            <div className="technology-item" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* My Contribution */}
      <section className="case-study-section">
        <p className="section-label">MY CONTRIBUTION</p>

        <div className="case-study-content">
          <h2>Bringing the interface and experience together.</h2>

          <p>
            I worked on the frontend and UI implementation,
            including the user-facing screens, map integration
            and midpoint feature.
          </p>
        </div>

        <div className="contribution-grid">
          {[
            ["01", "Frontend development", "Built the user-facing interface."],
            ["02", "UI implementation", "Translated interface concepts into functional screens."],
            ["03", "Map integration", "Integrated map functionality for location-based discovery."],
            ["04", "Midpoint feature", "Worked on finding a convenient meeting point between locations."],
          ].map(([number, title, description]) => (
            <div className="contribution-item" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>

      
      {/* What I Learned */}
      <section className="case-study-section learning-section">
        <p className="section-label">WHAT I LEARNED</p>

        <div className="case-study-content">
          <h2>
            Building a product is about more than making
            the interface work.
          </h2>

          <p>
            Working on DinePoint helped me understand how
            interface decisions, location-based functionality
            and user flow come together to create a useful
            product experience.
          </p>
        </div>

        <div className="learning-grid">
          <div className="learning-item">
            <span>01</span>
            <h3>THINKING ABOUT USER FLOW</h3>
            <p>
              Designing the experience around how users
              move from one task to the next.
            </p>
          </div>

          <div className="learning-item">
            <span>02</span>
            <h3>WORKING WITH LOCATION FEATURES</h3>
            <p>
              Understanding how maps and location-based
              functionality influence the interface.
            </p>
          </div>

          <div className="learning-item">
            <span>03</span>
            <h3>TURNING IDEAS INTO INTERFACES</h3>
            <p>
              Translating a product idea into clear, usable
              screens and interactions.
            </p>
          </div>
        </div>
      </section>

      {/* Future Improvements */}
      <section className="case-study-section future-section">
        <p className="section-label">FUTURE IMPROVEMENTS</p>

        <div className="case-study-content">
          <h2>
            Expanding DinePoint into a more
            personalized experience.
          </h2>

          <p>
            The current version focuses on restaurant discovery
            and midpoint-based recommendations. Future
            improvements could make the experience more
            personalized, connected and useful.
          </p>
        </div>

        <div className="future-grid">
          <div className="future-item">
            <span>01</span>
            <h3>LIVE GPS LOCATION</h3>
            <p>
              Use real-time location data to make restaurant
              discovery and midpoint calculations more dynamic.
            </p>
          </div>

          <div className="future-item">
            <span>02</span>
            <h3>PERSONALIZATION</h3>
            <p>
              Recommend restaurants based on user preferences,
              previous choices and location.
            </p>
          </div>

          <div className="future-item">
            <span>03</span>
            <h3>CLOUD DATA</h3>
            <p>
              Move restaurant data to a cloud-based system so
              information can be updated more easily.
            </p>
          </div>

          <div className="future-item">
            <span>04</span>
            <h3>BOOKING &amp; AVAILABILITY</h3>
            <p>
              Extend the platform with restaurant availability
              and booking functionality.
            </p>
          </div>
        </div>
      </section>

      
      {/* Footer */}
      <footer className="case-study-footer">
        <div className="footer-content">
          <p className="footer-label">DINEPOINT</p>

          <h2>Thanks for exploring the project.</h2>

          <a href="/#work" className="footer-link">
            ← BACK TO PORTFOLIO
          </a>
        </div>

        <div className="footer-bottom">
          <p>Designed &amp; built by Shreya.</p>
          <p>© 2026</p>
        </div>
      </footer>


    </main>
  )
}

export default DinePointCaseStudy
