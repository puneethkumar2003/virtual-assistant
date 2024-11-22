const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
const resultsDiv = document.getElementById('results');

function speak(text) {
  const text_speak = new SpeechSynthesisUtterance(text);
  text_speak.rate = 1;
  text_speak.volume = 1;
  text_speak.pitch = 1;
  window.speechSynthesis.speak(text_speak);
}

function wishMe() {
  const day = new Date();
  const hour = day.getHours();

  if (hour >= 0 && hour < 12) {
    speak("Good Morning Boss...");
  } else if (hour >= 12 && hour < 17) {
    speak("Good Afternoon Master...");
  } else {
    speak("Good Evening Sir...");
  }
}

window.addEventListener('load', () => {
  speak("Initializing JARVIS...");
  wishMe();
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onresult = (event) => {
  const currentIndex = event.resultIndex;
  const transcript = event.results[currentIndex][0].transcript;
  content.textContent = transcript;
  takeCommand(transcript.toLowerCase());
};

btn.addEventListener('click', () => {
  content.textContent = "Listening...";
  recognition.start();
});

function takeCommand(message) {
  if (message.includes('hey') || message.includes('hello')) {
    speak("Hello Sir, How May I Help You?");
  } else if (message.includes("open google")) {
    window.open("https://google.com", "_blank");
    speak("Opening Google...");
  } else if (message.includes("open youtube")) {
    window.open("https://youtube.com", "_blank");
    speak("Opening Youtube...");
  } else if (message.includes("open facebook")) {
    window.open("https://facebook.com", "_blank");
    speak("Opening Facebook...");
  } else if (message.includes('what is') || message.includes('who is') || message.includes('what are')) {
    window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
    const finalText = "This is what I found on the internet regarding " + message;
    speak(finalText);
  } else if (message.includes('wikipedia')) {
    window.open(`https://en.wikipedia.org/wiki/${message.replace("wikipedia", "").trim()}`, "_blank");
    const finalText = "This is what I found on Wikipedia regarding " + message;
    speak(finalText);
  } else if (message.includes('time')) {
    const time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
    const finalText = "The current time is " + time;
    speak(finalText);
  } else if (message.includes('date')) {
    const date = new Date().toLocaleString(undefined, { month: "short", day: "numeric" });
    const finalText = "Today's date is " + date;
    speak(finalText);
  } else if (message.includes('calculator')) {
    window.open('Calculator:///');
    const finalText = "Opening Calculator";
    speak(finalText);
  } else if (message.includes('search web for')) {
    const searchQuery = message.replace('search web for', '').trim();
    searchWeb(searchQuery, displayResults); // Call search function
  } else if (message.includes('play music') || message.includes('play video')) {
    speak("I can't directly play media yet, but here are some options on the web.");
    window.open(`https://www.youtube.com/search?q=${message.replace(" ", "+")}`, "_blank");
  } else if (message.includes('set reminder') || message.includes('set alarm')) {
    speak("Please specify the time in minutes.");
    recognition.onresult = (event) => {
      const time = event.results[0][0].transcript;
      const timeInMinutes = parseInt(time);
      if (isNaN(timeInMinutes)) {
        speak("Sorry, I couldn't understand the time. Please try again.");
      } else {
        setTimeout(() => {
          speak("Reminder: Time's up!");
        }, timeInMinutes * 60000);
        speak(`Reminder set for ${timeInMinutes} minutes.`);
      }
    };
    recognition.start();
  } else if (message.includes('take a note')) {
    speak("Dictate your note.");
    recognition.onresult = (event) => {
      const note = event.results[0][0].transcript;
      localStorage.setItem('note', note);
      speak("Note saved.");
    };
    recognition.start();
  } else if (message.includes('show notes')) {
    const note = localStorage.getItem('note');
    if (note) {
      speak("Here is your note: " + note);
      resultsDiv.textContent = note;
    } else {
      speak("You have no notes.");
    }
  } else if (message.includes('weather')) {
    const apiKey = '6557d74e50743d4a8ef0866517997b1a'; // Replace with your actual API key
    const city = 'germany'; // Replace with the desired city or make it dynamic
    fetch(`https://api.openweathermap.org/data/2.5/weather?id=${city}&appid=${apiKey}`)
     .then(data => {
  if (data.weather) {
    const weather = `The weather in ${data.name} is ${data.weather[0].description} with a temperature of ${(data.main.temp - 273.15).toFixed(2)}°C.`;
    speak(weather);
    resultsDiv.textContent = weather;
  } else {
    console.error("No weather information found for this city.");
    speak("Sorry, I couldn't find the weather information for that city.");
  }
})
  } else if (message.includes('news')) {
    const apiKey = '1ccd306366cf4b259bdd3b535d7c59a4'; // Replace with your actual API key
    fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`)
      .then(response => response.json())
      .then(data => {
        const news = data.articles.map(article => article.title).join('. ');
        speak("Here are some news updates: " + news);
        resultsDiv.textContent = news;
      })
      .catch(error => console.error(error));
  } else if (message.includes('control lights') || message.includes('adjust thermostat')) {
    speak("This functionality is not available yet for smart home devices.");
  } else {
    window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
    const finalText = "I found some information for " + message + " on Google";
    speak(finalText);
  }
}

function displayResults(data) {
  resultsDiv.innerHTML = "";
  const resultList = document.createElement('ul');
  for (const item of data) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<a href="${item.url}">${item.name}</a>`; // Assuming 'name' field for title
    resultList.appendChild(listItem);
  }
  resultsDiv.appendChild(resultList);
}

function searchWeb(query, callback) {
  const apiKey = 'YOUR_BING_SEARCH_API_KEY'; // Replace with your actual API key
  const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}`;

  fetch(url, {
    headers: { 'Ocp-Apim-Subscription-Key': apiKey }
  })
    .then(response => response.json())
    .then(data => callback(data.webPages.value))
    .catch(error => console.error(error));
}
