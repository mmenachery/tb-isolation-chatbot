import React from "react";
import "./homepage.css";

export default function HomePage({ onGetStarted }) {
  return (
    <div className="homepage-container">
      <div className="homepage-content">
        {/* Logo Section */}
        <div className="logo-section">
          {/* Replace this div with your actual logo image */}
          <div className="logo-placeholder">
            <h1>TB Isolation Assistant</h1>
          </div>
        </div>

        {/* Description Section */}
        <div className="description-section">
          <h2>Welcome to the TB Isolation Decision Support Tool</h2>
          <p>
            This tool helps healthcare providers make informed decisions about tuberculosis (TB) 
            patient isolation based on clinical guidelines and patient-specific factors.
          </p>
          <p>
            [Add more description here about what the tool does, who it's for, and how it helps]
          </p>
        </div>

        {/* Get Started Button */}
        <button className="get-started-btn" onClick={onGetStarted}>
          Get Started
        </button>

        {/* Resources Section */}
        <div className="resources-section">
          <h3>Additional Resources</h3>
          <div className="resources-list">
            <div className="resource-item">
              <a href="https://academic.oup.com/cid/advance-article/doi/10.1093/cid/ciae199/7649400?login=false" target="_blank" rel="noopener noreferrer">
              <h4>NTCA Guidelines</h4>
              </a>
              <p>National Tuberculosis Coalition of America Guidelines for Respiratory Isolation and Restrictions to Reduce Transmission of Pulmonary Tuberculosis in Community Settings</p>
              <a href="https://academic.oup.com/cid/advance-article/doi/10.1093/cid/ciae199/7649400?login=false" target="_blank" rel="noopener noreferrer">Learn More →</a>
            </div>

            <div className="resource-item">
              <a href="https://academic.oup.com/jid/article/231/1/31/7814557?login=false" target="_blank" rel="noopener noreferrer">
                <h4>The Journal of Infectious Diseases</h4>
              </a>
              <p>Rights-Based Legal Considerations for Tuberculosis Isolation Practices in Community Settings in the Postpandemic Era</p>
              <a href="https://academic.oup.com/jid/article/231/1/31/7814557?login=false" target="_blank" rel="noopener noreferrer">Learn More →</a>
            </div>

            <div className="resource-item">
              <a href="https://stacks.cdc.gov/view/cdc/22079" target="_blank" rel="noopener noreferrer">
                <h4>CDC: TB Policy Handbook</h4>
              </a>
              <p>Tuberculosis control laws and policies : a handbook for public health and legal practitioners</p>
              <a href="https://stacks.cdc.gov/view/cdc/22079" target="_blank" rel="noopener noreferrer">Learn More →</a>
            </div>
            
            <div className="resource-item">
              <a href="https://academic.oup.com/jid/article/231/1/10/7814559?login=false" target="_blank" rel="noopener noreferrer">
                <h4>The Journal of Infectious Diseases</h4>
              </a>
              <p>Assessing Infectiousness and the Impact of Effective Treatment to Guide Isolation Recommendations for People With Pulmonary Tuberculosis</p>
              <a href="https://academic.oup.com/jid/article/231/1/10/7814559?login=false" target="_blank" rel="noopener noreferrer">Learn More →</a>
            </div>
            
            <div className="resource-item">
              <h4>Resource Title 5</h4>
              <p>Brief description of resource</p>
              <a href="#" target="_blank" rel="noopener noreferrer">Learn More →</a>
            </div>
            
            <div className="resource-item">
              <h4>Resource Title 6</h4>
              <p>Brief description of resource</p>
              <a href="#" target="_blank" rel="noopener noreferrer">Learn More →</a>
            </div>
            
          </div>
        </div>

        {/* Footer */}
        <div className="homepage-footer">
          <p>© 2024 TB Isolation Assistant. For educational purposes only.</p>
        </div>
      </div>
    </div>
  );
}