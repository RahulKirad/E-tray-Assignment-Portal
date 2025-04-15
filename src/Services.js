import React from 'react';
import './Services.css';

const Services = () => {
  return (
    <div className="services-container">
      <header className="services-header">
        <h2>OUR SERVICES</h2>
        <p>
          Welcome to our suite of services that empower entrepreneurs, startups,
          and organizations to thrive in the ever-evolving business landscape.
          Whether you are seeking comprehensive skilling programs, startup support,
          research services, or specialized consulting, our diverse offerings
          cater to your unique needs.
        </p>
        <p>
          Explore the world of opportunities with <strong>PASSIONIT</strong>, <strong>PCOMBINATOR</strong>,
          <strong> PASSION FRAMEWORK</strong>, <strong>PROSPERO</strong>, <strong>POPSHORES</strong>, and <strong>MOMSHORES</strong>.
        </p>
      </header>

      <section className="service-group">
        <h3>PASSION IT — Advanced IT Skilling and More</h3>
        <div className="service-card">
          <h4>Individual and Family Memberships</h4>
          <p>Unlock advanced IT skills in UIX, AI, RPA, Data Analytics, and more through our affordable membership plans.</p>
        </div>
        <div className="service-card">
          <h4>Entrepreneurship Varsities</h4>
          <p>Free entrepreneurship varsities within colleges to nurture the spirit of innovation among students.</p>
        </div>
        <div className="service-card">
          <h4>Corporate Collaboration</h4>
          <p>Encourage corporates to collaborate with PASSIONIT for problem-solving and support.</p>
        </div>
      </section>

      <section className="service-group">
        <h3>PCOMBINATOR — Your Startup Catalyst</h3>
        <div className="service-card">
          <h4>Startup Consulting Tiers</h4>
          <p>Bronze, Silver, Gold, and Platinum consulting packages tailored to meet diverse startup needs.</p>
        </div>
        <div className="service-card">
          <h4>Fundraising Expertise</h4>
          <p>Raise capital success fee of 4% with PCOMBINATOR’s expertise in fundraising.</p>
        </div>
        <div className="service-card">
          <h4>Game of Entrepreneurship</h4>
          <p>Engage in an immersive entrepreneurial experience with our ‘Game of Entrepreneurship’.</p>
        </div>
      </section>

      <section className="service-group">
        <h3>PASSION FRAMEWORK — Enabling Research and Development</h3>
        <div className="service-card">
          <h4>Research Papers and Journals</h4>
          <p>Publish your research papers for free and contribute to the collective knowledge base.</p>
        </div>
        <div className="service-card">
          <h4>Short Films and Entertainment</h4>
          <p>Bring stories to life through creative and thought-provoking short films.</p>
        </div>
      </section>

      <section className="service-group">
        <h3>PROSPERO — Startup Support Services</h3>
        <div className="service-card">
          <h4>Product Launch and Support</h4>
          <p>Comprehensive support for startups in product launch and ongoing management.</p>
        </div>
        <div className="service-card">
          <h4>Fundraising Platform</h4>
          <p>Access PROSPERO’s platform for efficient capital raising tailored to startups.</p>
        </div>
      </section>

      <section className="service-group">
        <h3>POPSHORES — Marketing and E-commerce Solutions</h3>
        <div className="service-card">
          <h4>Digital Marketing and E-commerce Marts</h4>
          <p>Leverage POPSHORES for digital marketing, tele-calling, and direct sales support.</p>
        </div>
        <div className="service-card">
          <h4>Blogging and Content Creation</h4>
          <p>Enhance your online presence with quality content creation and blogging services.</p>
        </div>
      </section>

      <section className="service-group">
        <h3>MOMSHORES — Social Enterprise Support</h3>
        <div className="service-card">
          <h4>Digital Marketing for NGOs</h4>
          <p>Dedicated marketing support to amplify the impact of NGOs and social enterprises.</p>
        </div>
        <div className="service-card">
          <h4>Social Impact Programs</h4>
          <p>Bridge the gap between the privileged and underprivileged with inclusive skilling programs.</p>
        </div>
      </section>

      <section className="services-cta">
        <h2>Get Started with Our Services Today</h2>
        <p>Join us in transforming ideas into reality – because your journey to greatness starts now.</p>
        <a href="https://passionit.com/" target="_blank" rel="noopener noreferrer">
  <button className="get-started-btn">Get Started Now</button>
</a>
      </section>
    </div>
  );
};

export default Services;
