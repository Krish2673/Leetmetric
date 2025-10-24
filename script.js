document.addEventListener("DOMContentLoaded", function () {
  const userInput = document.getElementById("username");
  const search = document.getElementById("search-button");
  const easyCircle = document.querySelector(".circle1");
  const mediumCircle = document.querySelector(".circle2");
  const hardCircle = document.querySelector(".circle3");
  const totalCircle = document.querySelector(".circle4");
  const cards = document.querySelector(".cards");
  const easyLabel = document.getElementById("easy-label");
  const mediumLabel = document.getElementById("medium-label");
  const hardLabel = document.getElementById("hard-label");
  const totalLabel = document.getElementById("total-label");
  const avatar = document.getElementById("avatar");
  const rank = document.getElementById("rank");
  const contestRating = document.getElementById("contest-rating");
  const profileInfo = document.querySelector(".profile-info");
  const totalSolvedEl = document.getElementById("total-solved");

  function validateUsername(username) {
    if (username.trim() === "") {
      alert("Username should not be empty");
      return false;
    }
    const regex = /^[a-zA-Z][a-zA-Z0-9_]{1,19}$/;
    if (!regex.test(username)) {
      alert("Invalid Username");
      return false;
    }
    return true;
  }

  async function fetchUserDetails(username) {
    try {
      document.body.style.cursor = "wait";
      search.textContent = "Searching...";
      search.disabled = true;

      const apiUrl = `https://leetcode-stats-api.herokuapp.com/${username}`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);

      const data = await response.json();
      if (!data || data.status !== "success")
        throw new Error(data.message || "User not found or API error");

      displayUserData(data);
      localStorage.setItem("lastUsername", username);
    } catch (err) {
      console.error("Error:", err);
      document.querySelector(".cards").innerHTML = `<p class="error">${err.message}</p>`;
      profileInfo.style.display = "none";
      totalSolvedEl.textContent = "";
      [easyCircle, mediumCircle, hardCircle, totalCircle].forEach(c =>
        c.style.setProperty("--progress-degree", "0%")
      );
      [easyLabel, mediumLabel, hardLabel, totalLabel].forEach(l => l.textContent = "0/0");
    } finally {
      document.body.style.cursor = "default";
      search.textContent = "Search";
      search.disabled = false;
    }
  }

  function updateProgress(solved, total, label, circle) {
    const percent = total > 0 ? (solved / total) * 100 : 0;
    circle.style.setProperty("--progress-degree", `${percent}%`);
    label.textContent = `${solved}/${total}`;
  }

  function displayUserData(data) {
    const {
      totalQuestions = 0,
      totalSolved = 0,
      easySolved = 0,
      totalEasy = 0,
      mediumSolved = 0,
      totalMedium = 0,
      hardSolved = 0,
      totalHard = 0,
      ranking = "N/A",
      contributionPoints = "N/A",
      acceptanceRate
    } = data;

    updateProgress(easySolved, totalEasy, easyLabel, easyCircle);
    updateProgress(mediumSolved, totalMedium, mediumLabel, mediumCircle);
    updateProgress(hardSolved, totalHard, hardLabel, hardCircle);
    updateProgress(totalSolved, totalQuestions, totalLabel, totalCircle);

    totalSolvedEl.textContent = `Total Solved: ${totalSolved}`;
    rank.textContent = `Global Rank: ${ranking}`;
    contestRating.textContent = `Contribution: ${contributionPoints}`;
    avatar.src = data.avatar || "https://assets.leetcode.com/users/avatar.png";
    profileInfo.style.display = "flex";

    const cardsArr = [];

    const total = easySolved + mediumSolved + hardSolved;
    if (total > 0) {
      const easyPct = ((easySolved / total) * 100).toFixed(1);
      const medPct = ((mediumSolved / total) * 100).toFixed(1);
      const hardPct = ((hardSolved / total) * 100).toFixed(1);
      cardsArr.push({
        label: "Difficulty Breakdown",
        value: `Easy ${easyPct}% • Med ${medPct}% • Hard ${hardPct}%`
      });
    }

    if (acceptanceRate !== undefined) {
      cardsArr.push({ label: "Acceptance Rate", value: `${acceptanceRate}%` });
    }

    cards.innerHTML = cardsArr
      .map(
        (d) => `
        <div class="card">
          <h4>${d.label}</h4>
          <p>${d.value}</p>
        </div>
      `
      )
      .join("");
  }

  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") search.click();
  });

  search.addEventListener("click", () => {
    const username = userInput.value.trim();
    if (validateUsername(username)) fetchUserDetails(username);
  });

  const themeToggle = document.getElementById("theme-toggle");
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    themeToggle.textContent = document.body.classList.contains("light-mode") ? "🌙" : "🌞";
    localStorage.setItem(
      "theme",
      document.body.classList.contains("light-mode") ? "light" : "dark"
    );
  });

  const savedUser = localStorage.getItem("lastUsername");
  if (savedUser) {
    userInput.value = savedUser;
    fetchUserDetails(savedUser);
  }

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    themeToggle.textContent = "🌙";
  } else {
    themeToggle.textContent = "🌞";
  }
});