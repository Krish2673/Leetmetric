document.addEventListener("DOMContentLoaded",function() {

    const userInput = document.getElementById("username");
    const search = document.getElementById("search-button");
    const stats = document.querySelector(".stats");
    const easyCircle = document.querySelector(".circle1");
    const mediumCircle = document.querySelector(".circle2");
    const hardCircle = document.querySelector(".circle3");
    const cards = document.querySelector(".cards");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".cards");
    const avatar = document.getElementById("avatar");
    const rank = document.getElementById("rank");
    const contestRating = document.getElementById("contest-rating");

    function validateUsername(username) {
        if(username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z][a-zA-Z0-9_]{1,19}$/;
        const isMatching = regex.test(username);
        if(!isMatching)
            alert("Invalid Username");
        return isMatching;
    }

    async function fetchUserDetails(username) {

        try {
            document.body.style.cursor = "wait";
            search.textContent = "Searching...";
            search.disabled = true;

            // const response = await fetch(url);
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/' 
            const targetUrl = 'https://leetcode.com/graphql/';

            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphql = JSON.stringify({
                query: `
                    query userSessionProgress($username: String!) {
                      allQuestionsCount {
                        difficulty
                        count
                      }
                      matchedUser(username: $username) {
                        profile {
                          ranking
                          userAvatar
                        }
                        submitStats {
                          acSubmissionNum {
                            difficulty
                            count
                            submissions
                          }
                          totalSubmissionNum {
                            difficulty
                            count
                            submissions
                          }
                        }
                      }
                    }
                `,
                variables: { username }
            });
            
            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
            };

            const response = await fetch(proxyUrl+targetUrl,requestOptions);
            if(!response.ok) {
                throw new Error("Unable to fetch user details");
            }
            const parsedData = await response.json();
            console.log("Logging data: ", parsedData);

            const userData = parsedData.data.matchedUser;
            if (!userData) {
                throw new Error("User not found");
            }

            displayUserData(parsedData);
        }

        catch(error) {
            stats.innerHTML = `<p>${error.message}</p>`;
        }

        finally {
            document.body.style.cursor = "default";
            search.innerHTML = "Search";
            search.disabled = false;
        }
        
    }

    function updateProgress(solved, total, label, circle) {
        const progressDegree = (solved/total)*100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    function displayUserData(parsedData) {
        const totalQues = parsedData.data.allQuestionsCount[0].count;
        const totalEasyQues = parsedData.data.allQuestionsCount[1].count;
        const totalMediumQues = parsedData.data.allQuestionsCount[2].count;
        const totalHardQues = parsedData.data.allQuestionsCount[3].count;

        const solvedTotalQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedEasyQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedMediumQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedHardQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress(solvedEasyQues, totalEasyQues, easyLabel, easyCircle);
        updateProgress(solvedMediumQues, totalMediumQues, mediumLabel, mediumCircle);
        updateProgress(solvedHardQues, totalHardQues, hardLabel, hardCircle);

        const cardsData = [
            {label: "Overall Submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions },
            {label: "Overall Easy Submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions },
            {label: "Overall Medium Submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions },
            {label: "Overall Hard Submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions },
        ];

        console.log("card ka data: " , cardsData);

        cardStatsContainer.innerHTML = cardsData.map(
            data => 
                    `<div class="card">
                    <h4>${data.label}</h4>
                    <p>${data.value}</p>
                    </div>`
        ).join("")

        avatar.src = parsedData.data.matchedUser.profile.userAvatar;
        rank.textContent = `Global Rank: ${parsedData.data.matchedUser.profile.ranking}`;
        contestRating.textContent = `Contest Rating: ${parsedData.data.matchedUser.profile.contestRating || 'N/A'}`;

        // Make the profile section visible
        document.querySelector(".profile-info").style.display = "flex";

    }

    userInput.addEventListener('keydown', (e) => {
        if (e.key === "Enter") search.click();
    });    

    search.addEventListener('click',function() {
        const username = userInput.value;
        console.log("Logging in : ",username);
        if(validateUsername(username)) {
            fetchUserDetails(username);
        }
    })

})