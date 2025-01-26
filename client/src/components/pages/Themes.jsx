import { updateThemeVariables } from "../../utilities";
import { useState } from "react";
import { useContext } from "react";
import NavBar from "../modules/NavBar";
import { get } from "../../utilities";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Themes.css";

const Themes = () => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [theme, setTheme] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [guest, setGuest] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    get("/api/whoami").then((res) => {
      if (!res.name) {
        navigate("/");
        return;
      }
      setLoggedIn(true);
      setGuest(res.isGuest);
    });
  });

  // Function to parse CSS variables from a CSS-like string
  const parseCSSVariables = (cssString) => {
    const variables = {};

    // Split the string by semicolons to process each line
    cssString.split(";").forEach((line) => {
      if (line.trim() === "") return; // Skip empty lines

      // Split each line into a key and value
      const [key, value] = line.split(":").map((str) => str.trim());

      if (key && value) {
        variables[key] = value; // Add to the variables object
      }
    });

    return variables;
  };

  // Fetch and apply the theme
  const onThemeClick = () => {
    if (isLoading) return;

    if (!theme.trim()) {
      alert("Please enter a theme.");
      return;
    }

    setIsLoading(true); // Set loading to true

    get("/api/getTheme", { theme })
      .then((res) => {
        const content = res.content;
        console.log("Response Content:", content[0].text);

        const newTheme = parseCSSVariables(content[0].text);
        updateThemeVariables(newTheme);
      })
      .catch((err) => {
        console.error("Error fetching theme:", err.message || err);
      })
      .finally(() => {
        setIsLoading(false); // Reset loading state
      });
  };

  return !isLoggedIn ? (
    <div className="intermediate-container"></div>
  ) : (
    <>
      <NavBar />
      <div className="theme-container">
        <div className="theme-title">Themes</div>

        <div className="input-theme-container">
          <input
            type="text"
            placeholder="Enter theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)} // Update the theme state
            className="theme-input"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onThemeClick(); // Trigger the join room click when Enter is pressed
              }
            }}
          />
          <div onClick={onThemeClick} className="theme-button">
            Apply Theme
          </div>
        </div>
        <div className="saved-themes-container">
          <div className="individual-theme">
            <div className="theme-text">Default</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Themes;
