import { updateThemeVariables } from "../../utilities";
import { useState } from "react";
import { useContext } from "react";
import { UserContext } from "../App";
import NavBar from "../modules/NavBar";
import { get, post } from "../../utilities";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Themes.css";

const Themes = () => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [theme, setTheme] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [guest, setGuest] = useState(false);
  const [curTheme, setCurTheme] = useState("");
  const [curThemeCode, setCurThemeCode] = useState("");
  const [savedThemes, setSavedThemes] = useState([]);
  const [userId, setUserId] = useState(undefined);
  const [buttonText, setButtonText] = useState("Save Theme");
  const navigate = useNavigate();

  useEffect(() => {
    get("/api/whoami").then((res) => {
      if (!res.name) {
        navigate("/");
        return;
      }
      setLoggedIn(true);
      setGuest(res.isGuest);
      setUserId(res._id);
      get(`/api/getSavedThemes/${res._id}`)
        .then((themes) => {
          setSavedThemes(themes || []); // Populate themes from the server
        })
        .catch((err) => {
          console.error("Failed to fetch saved themes:", err);
        });
    });
  }, []);

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
        const newTheme = parseCSSVariables(content[0].text);
        updateThemeVariables(newTheme);
        setCurTheme(theme);
        setCurThemeCode(newTheme);
        post("/api/add-theme", {
          userId,
          themeName: theme, // Match the backend field name
          themeCode: JSON.stringify(newTheme), // Match the backend field name
        })
          .then((res) => {
            setSavedThemes((prevThemes) => [
              ...prevThemes,
              { name: theme, cssVariables: JSON.stringify(newTheme) },
            ]); // Add the new theme to the savedThemes state
        
            setButtonText("Theme Saved!");
            setTheme("");
            // Revert the button text back to "Save Theme" after 2 seconds
            setTimeout(() => {
              setButtonText("Save Theme");
            }, 1000);
          })
          .catch((err) => {
            console.error("Theme already exists or error while saving:", err);
          });
      })
      .catch((err) => {
        console.error("Error fetching theme:", err.message || err);
      })
      .finally(() => {
        setIsLoading(false); // Reset loading state
      });
  };

  const onDeleteClick = () => {
    post("/api/delete-theme", {
      userId,
      themeName: curTheme,
      themeCode: JSON.stringify(curThemeCode),
    }).then((res) => {
      setSavedThemes(res); // Update state with the new theme list
    });
  };

  return !isLoggedIn ? (
    <div className="intermediate-container"></div>
  ) : (
    <>
      <NavBar />
      <div className="theme-container">
        <div className="theme-title">Color Themes</div>

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
            {isLoading ? "Generating theme..." : "Generate Theme"}
          </div>
        </div>
        <div className="saved-themes-container">
          {savedThemes && savedThemes.length > 0 ? (
            savedThemes.map((savedTheme, index) => {
              let cssVariables = {};
              if (typeof savedTheme.cssVariables === "string") {
                try {
                  cssVariables = JSON.parse(savedTheme.cssVariables);
                } catch (error) {
                  console.error(
                    `Error parsing CSS variables for theme "${savedTheme.name}":`,
                    error
                  );
                }
              } else {
                cssVariables = savedTheme.cssVariables || {};
              }

              return (
                <div
                  key={index}
                  className="individual-theme"
                  style={{
                    backgroundImage: `
                    linear-gradient(
                      45deg,
                      ${cssVariables["--dark--brown"] || "#4B2E2A"},
                      ${cssVariables["--brown"] || "#855E52"},
                      ${cssVariables["--light--brown"] || "#D7B8A2"},
                      ${cssVariables["--dark--brown"] || "#4B2E2A"},
                      ${cssVariables["--light--brown"] || "#D7B8A2"}
                    )
                  `,
                    color: cssVariables["--white"] || "#FFFFFF", // Fallback for text color
                    cursor: "pointer", // Visual cue for interactivity
                  }}
                  onClick={() => {
                    updateThemeVariables(cssVariables); // Apply theme globally
                    setCurTheme(savedTheme.name);
                    setCurThemeCode(savedTheme.cssVariables);
                  }}
                >
                  <div className="theme-text">{savedTheme.name || `Theme ${index + 1}`}</div>
                  {index !== 0 && savedTheme.name == curTheme && (
                    <img
                      src="/images/trash.png"
                      alt="Trash"
                      className="trash"
                      onClick={onDeleteClick}
                    />
                  )}
                </div>
              );
            })
          ) : (
            <div className="no-themes">No saved themes available</div>
          )}
        </div>
      </div>
    </>
  );
};

export default Themes;
