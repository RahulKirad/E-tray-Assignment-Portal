import React from 'react';
import './About.css';

const About = () => {
  return (
    <>
      <nav className="about-navbar">
        <div className="navbar-title">About Us</div>
      </nav>

      <div className="about-container">
        <header className="about-header">       
          <p>
            At <strong>PASSIONIT</strong>, we are committed to fostering a culture of innovation,
            collaboration, and knowledge sharing. With a focus on structured audit
            methodology, research papers, and impactful short films, we provide a
            holistic platform for individuals and organizations to thrive in the
            ever-evolving business landscape.
          </p>
          <h3>“POP Makes Difference..”</h3>
        </header>

        <section className="about-section">
          <h2>Empowering Innovation, Research, and Development</h2>
          <p>
            Our comprehensive framework serves as a catalyst for startups,
            incubators, accelerators, researchers, academicians, students,
            industry thought leaders, and professionals exploring the entrepreneurial
            landscape.
          </p>
          <h4>Elevate Your Goals: Tailored Solutions for Every Need with PASSIONIT</h4>
        </section>

        <section className="about-services">
          <h2>Our Key Offerings for Your Success</h2>
          <div className="service-card">
            <h3>01. Structured Audit Methodology</h3>
            <p>
              Our structured audit methodology offers a meticulous review of
              startups, incubators, and accelerators’ governance structures.
              Identify strengths, areas of improvement, and actionable insights
              with precision.
            </p>
          </div>
          <div className="service-card">
            <h3>02. Research Papers and Journals</h3>
            <p>
              PASSION FRAMEWORK is a haven for researchers and scholars, offering
              a platform to publish research papers for free. Contribute to the
              collective knowledge base and drive innovation in your field.
            </p>
          </div>
          <div className="service-card">
            <h3>03. Short Films and Entertainment</h3>
            <p>
              Bring stories penned in PASSION FRAMEWORK to life with impactful
              short films. Engage audiences with creative and thought-provoking
              content.
            </p>
          </div>
        </section>

        <section className="about-collaboration">
          <h2>We Offer Collaboration Opportunities that Help Foster Success</h2>
          <div className="collab-card">
            <h3>Startup Support</h3>
            <p>
              Collaborate for product launch and ongoing management with our
              expertise in IT-enabled services, digital marketing, and tech support.
            </p>
          </div>
          <div className="collab-card">
            <h3>Consulting for Incubators and Accelerators</h3>
            <p>
              PCOMBINATOR offers consulting services for incubators, investors,
              and corporates to foster R&D and innovation labs.
            </p>
          </div>
        </section>

        <section className="about-recognition">
          <h2>Global Recognition</h2>
          <p>
            PASSION FRAMEWORK is globally recognized and was benchmarked by UBI
            Global as one of the Top Asia Pacific Challengers in their 2021–2022
            Incubator Assessments.
          </p>
        </section>

        <section className="about-membership">
          <h2>Explore Our Services & Join Our Community</h2>
          <div className="membership-card">
            <h3>1. Membership Options</h3>
            <p>
              Explore PASSIONIT, offering advanced IT skilling. Choose from individual,
              family, and specialized memberships with a focus on employment.
            </p>
          </div>
          <div className="membership-card">
            <h3>2. Entrepreneurship Varsities & Free Training</h3>
            <p>
              PASSION FRAMEWORK supports free entrepreneurship varsities in 25+
              colleges, bridging the gap between the “HAVES” and “HAVE NOTS.”
            </p>
          </div>
        </section>

        <section className="about-cta">
          <h2>Let’s Connect Together</h2>
          <p>
            Unlock a world of possibilities with PASSION FRAMEWORK – where innovation
            meets structured governance, research, and development.
          </p>
          <p className="cta-quote">
            “Empower your ideas, thrive in innovation, and contribute to the future
            with PASSION FRAMEWORK – where passion meets limitless possibilities.”
          </p>
          <a href="https://passionit.com/" target="_blank" rel="noopener noreferrer">
  <button className="connect-btn">Get Connected</button>
</a>
        </section>
      </div>
    </>
  );
};

export default About;
