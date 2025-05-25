import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Style from "../App.module.css";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

function MainPage() {
  const navigate = useNavigate();
  const [showUserInfo, setShowUserInfo] = useState(false);

  let userFirstName = localStorage.getItem("userFirstName") || "John";
  let userLastName = localStorage.getItem("userLastName") || "Doe";
  let userEmailAddress =
    localStorage.getItem("userEmailAddress") || "john.doe@example.com";

  const [showPopup, setShowPopup] = useState(false);
const [formData, setFormData] = useState({
  interest: "",
  skills: "",
  goals: "",
});

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const [recommendationPopUp, setRecommendationPopUp] = useState(false);
  const [cohereRecommendation, setCohereRecommendation] = useState("");
  const [geminiRecommendation, setGeminiRecommendation] = useState("");
  const [showCohere, setShowCohere] = useState(true);
  const [showGemini, setShowGemini] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const response = await axios.post("http://localhost:5000/counsel", {
        interests: formData.interest,
        skills_to_learn: formData.skills,
        career_goals: formData.goals
      });

      console.log(JSON.stringify(response.data.cohere_recommendation));
      console.log(JSON.stringify(response.data.gemini_recommendation));

      // Set the recommendations in the state
      setCohereRecommendation(response.data.cohere_recommendation);
      setGeminiRecommendation(response.data.gemini_recommendation);
      setShowPopup(false);
      setRecommendationPopUp(true); // Show the recommendation popup

      alert("Recommendation received! Check below.");
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      alert("Failed to fetch recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  // Handle Cohere recommendation button click
  const handleCohereClick = () => {
    setShowCohere(true);
    setShowGemini(false); // Hide Gemini recommendation
  };

  // Handle Gemini recommendation button click
  const handleGeminiClick = () => {
    setShowCohere(false); // Hide Cohere recommendation
    setShowGemini(true);
  };

  return (
    <>
      <div className={Style.mainDiv}>
        <div className={Style.mainPageMainDiv}>
          <div className={Style.navBarMainPage}>
            <div className={Style.logoNavBarMainPage}>
              <h1>AspireBot</h1>
            </div>

            <div className={Style.ProfileBtnNavBarMainPage}>
              <button
                className={Style.profileBtn}
                onClick={() => setShowUserInfo(!showUserInfo)}
              >
                Profile
              </button>

              {showUserInfo && (
                <div className={Style.userInfoDiv}>
                  <p
                    className={Style.userInfoDivPara1}
                  >{`${userFirstName} ${userLastName}`}</p>
                  <p className={Style.userInfoDivPara2}>{userEmailAddress}</p>
                  <button className={Style.logoutBtn} onClick={logoutUser}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={Style.contentDivMainPage}>
            <div className={Style.converterHeadingDiv}>
              <h1>
                <span className={Style.cryptoCurrencyText}>AspireBot</span> -
                Your Career Guide
              </h1>
              {/* <p>
              CryptoPulse provides a personalized investment guide to help you
              make informed cryptocurrency decisions tailored to your financial
              goals and preferences.
            </p> */}
            </div>

            <div className={Style.sendCryptoCurrencyMainDiv}>
              <div className={Style.sendCryptoCurrencyContentDiv}>
                <div className={Style.mainDivInvestment}>
                  <p className={Style.investmentPara}>
                    AspireBot uses LangChain, Cohere, and Gemini to provide
                    personalized career guidance. LangChain tailors career paths
                    and skill recommendations based on your goals, while Cohere
                    simplifies complex insights into actionable advice. Gemini
                    adds real-time industry trends and job market data, helping
                    you make informed decisions and plan your career with
                    confidence.
                  </p>

                  <div className={Style.logoMainDiv}>
                    <div className={Style.imageContainerDiv}>
                      <img
                        src="https://logowik.com/content/uploads/images/google-ai-gemini91216.logowik.com.webp"
                        alt="Gemini Logo"
                      />
                    </div>
                    <div className={Style.imageContainerDiv}>
                      <img
                        src="https://images.seeklogo.com/logo-png/61/1/langchain-logo-png_seeklogo-611654.png"
                        alt="LangChain Logo"
                      />
                    </div>
                    <div className={Style.imageContainerDiv}>
                      <img
                        src="https://logowik.com/content/uploads/images/cohere-new9011.logowik.com.webp"
                        alt="Cohere Logo"
                      />
                    </div>
                  </div>

                  <div className={Style.getStartedBtnDiv}>
                    <button onClick={() => setShowPopup(true)}>Try Now</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Form */}
      {/* Popup Form */}
{showPopup && (
  <div className={Style.popupOverlay}>
    <div className={Style.popupContent}>
      <h2>Enter Your Career Preferences</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Interest
          <input
            type="text"
            name="interest"
            value={formData.interest}
            onChange={handleChange}
            required
             placeholder="e.g. Web Development, Data Science, AI"
          />
        </label>

        <label>
          Skills to Learn
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            required
             placeholder="e.g. JavaScript, React, Python"
          />
        </label>

        <label>
          Career Goals
          <input
            type="text"
            name="goals"
            value={formData.goals}
            onChange={handleChange}
            required
            placeholder="e.g. Become a Full Stack Developer, Work in AI, Start a Tech Company"
          />
        </label>

        <div className={Style.popupActions}>
          {/* Submit Button with dynamic text */}
          <button type="submit" disabled={loading}>
            {loading ? (
              <Box sx={{ display: "flex" }}>
                <CircularProgress size={24} color="white" />
              </Box>
            ) : (
              "Submit"
            )}
          </button>
          <button type="button" onClick={() => setShowPopup(false)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}


      {/* Pop for showing the recommendation result */}
      {/* Recommendation Popup */}
      {recommendationPopUp && (
        <div className={Style.recommendationPopUpOverlay}>
          <div className={Style.recommendationPopUpContent}>
            {/* Buttons to toggle between recommendations */}
            <div className={Style.recommendationBtnDivOption}>
              <button onClick={handleCohereClick}>Cohere Recommendation</button>
              <button onClick={handleGeminiClick}>Gemini Recommendation</button>
            </div>

            {/* Show Cohere recommendation */}
            {showCohere && (
              <div className={Style.responseDiv}>
                <p>{cohereRecommendation}</p>
              </div>
            )}

            {/* Show Gemini recommendation */}
            {showGemini && (
              <div className={Style.responseDiv}>
                <p>{geminiRecommendation}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default MainPage;
