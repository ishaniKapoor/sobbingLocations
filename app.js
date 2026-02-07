const storageKeys = {
  profile: "sobbing.profile",
  friends: "sobbing.friends",
  cries: "sobbing.cries",
};

const defaultProfile = {
  name: "Guest",
  handle: "@guest",
  avatar:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=200&h=200",
};

const defaultFriends = [
  {
    name: "Harper",
    handle: "@harper",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=facearea&w=200&h=200",
  },
  {
    name: "Jordan",
    handle: "@jordan",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&w=200&h=200",
  },
];

const defaultCries = [
  {
    id: crypto.randomUUID(),
    author: "@guest",
    name: "Guest",
    description: "Tears of relief after finishing a long sprint.",
    duration: "22 min",
    reason: "Work milestone",
    photo:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80",
    lat: 37.7749,
    lng: -122.4194,
    timestamp: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    author: "@harper",
    name: "Harper",
    description: "Sappy tears after a surprise visit from my cousin.",
    duration: "12 min",
    reason: "Happy cry",
    photo:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=80",
    lat: 40.7128,
    lng: -74.006,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
];

const state = {
  profile: loadStorage(storageKeys.profile, defaultProfile),
  friends: loadStorage(storageKeys.friends, defaultFriends),
  cries: loadStorage(storageKeys.cries, defaultCries),
};

const elements = {
  tabs: document.querySelectorAll(".tab"),
  panels: document.querySelectorAll(".panel"),
  feedList: document.getElementById("feedList"),
  mapCanvas: document.getElementById("mapCanvas"),
  mapList: document.getElementById("mapList"),
  friendCards: document.getElementById("friendCards"),
  cryAuthor: document.getElementById("cryAuthor"),
  cryForm: document.getElementById("cryForm"),
  profileForm: document.getElementById("profileForm"),
  friendForm: document.getElementById("friendForm"),
  seedData: document.getElementById("seedData"),
  chipName: document.getElementById("chipName"),
  profileChip: document.getElementById("profileChip"),
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

function loadStorage(key, fallback) {
  const saved = localStorage.getItem(key);
  if (!saved) {
    return fallback;
  }
  try {
    return JSON.parse(saved);
  } catch (error) {
    return fallback;
  }
}

function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function updateProfileChip() {
  elements.chipName.textContent = state.profile.name || "Guest";
  elements.profileChip.querySelector("img").src =
    state.profile.avatar || defaultProfile.avatar;
}

function renderAuthorOptions() {
  const people = [state.profile, ...state.friends];
  elements.cryAuthor.innerHTML = people
    .map(
      (person) =>
        `<option value="${person.handle}">${person.name} (${person.handle})</option>`
    )
    .join("");
}

function renderFriends() {
  elements.friendCards.innerHTML = state.friends
    .map(
      (friend) => `
      <div class="friend-card">
        <img src="${friend.avatar || defaultProfile.avatar}" alt="${friend.name}" />
        <div>
          <strong>${friend.name}</strong>
          <span>${friend.handle}</span>
        </div>
      </div>
    `
    )
    .join("");
}

function renderFeed() {
  elements.feedList.innerHTML = state.cries
    .slice()
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .map(
      (cry) => `
      <article class="card feed-card">
        <img src="${cry.photo || defaultProfile.avatar}" alt="Cry from ${cry.name}" />
        <div>
          <p class="eyebrow">${dateFormatter.format(new Date(cry.timestamp))}</p>
          <h4>${cry.name} <span>${cry.author}</span></h4>
          <div class="feed-meta">
            <span>${cry.duration}</span>
            <span>${cry.reason}</span>
          </div>
          <p>${cry.description}</p>
        </div>
      </article>
    `
    )
    .join("");
}

function latLngToPercent(lat, lng) {
  const x = ((lng + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x, y };
}

function renderMap() {
  const pins = state.cries
    .filter((cry) => typeof cry.lat === "number" && typeof cry.lng === "number")
    .map((cry) => {
      const { x, y } = latLngToPercent(cry.lat, cry.lng);
      const isYou = cry.author === state.profile.handle;
      return `
        <div class="pin ${isYou ? "you" : "friend"}" style="left: ${x}%; top: ${y}%;" title="${cry.name}"></div>
      `;
    })
    .join("");

  elements.mapCanvas.innerHTML = `
    <div class="map-overlay">
      <p>World view</p>
      <p>Use lat/lng to place pins</p>
    </div>
    ${pins}
  `;

  elements.mapList.innerHTML = state.cries
    .slice()
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .map(
      (cry) => `
      <div class="map-entry">
        <span class="dot ${cry.author === state.profile.handle ? "dot-you" : "dot-friend"}"></span>
        <div>
          <strong>${cry.name}</strong>
          <div>${cry.reason} · ${cry.duration}</div>
        </div>
      </div>
    `
    )
    .join("");
}

function bindTabs() {
  elements.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      elements.tabs.forEach((item) => item.classList.remove("active"));
      elements.panels.forEach((panel) => panel.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });
}

function handleCrySubmit(event) {
  event.preventDefault();
  const authorHandle = document.getElementById("cryAuthor").value;
  const authorProfile =
    authorHandle === state.profile.handle
      ? state.profile
      : state.friends.find((friend) => friend.handle === authorHandle);

  const newCry = {
    id: crypto.randomUUID(),
    author: authorHandle,
    name: authorProfile?.name || "Unknown",
    description: document.getElementById("cryDescription").value.trim(),
    duration: document.getElementById("cryDuration").value.trim(),
    reason: document.getElementById("cryReason").value.trim(),
    photo: document.getElementById("cryPhoto").value.trim(),
    lat: parseFloat(document.getElementById("cryLat").value),
    lng: parseFloat(document.getElementById("cryLng").value),
    timestamp: new Date().toISOString(),
  };

  if (Number.isNaN(newCry.lat)) {
    delete newCry.lat;
  }
  if (Number.isNaN(newCry.lng)) {
    delete newCry.lng;
  }

  state.cries.unshift(newCry);
  saveStorage(storageKeys.cries, state.cries);
  elements.cryForm.reset();
  renderFeed();
  renderMap();
}

function handleProfileSubmit(event) {
  event.preventDefault();
  state.profile = {
    name: document.getElementById("profileName").value.trim(),
    handle: document.getElementById("profileHandle").value.trim(),
    avatar: document.getElementById("profileAvatar").value.trim() || defaultProfile.avatar,
  };
  saveStorage(storageKeys.profile, state.profile);
  updateProfileChip();
  renderAuthorOptions();
  renderMap();
}

function handleFriendSubmit(event) {
  event.preventDefault();
  const newFriend = {
    name: document.getElementById("friendName").value.trim(),
    handle: document.getElementById("friendHandle").value.trim(),
    avatar: document.getElementById("friendAvatar").value.trim() || defaultProfile.avatar,
  };
  state.friends.push(newFriend);
  saveStorage(storageKeys.friends, state.friends);
  elements.friendForm.reset();
  renderFriends();
  renderAuthorOptions();
}

function seedSampleData() {
  state.profile = defaultProfile;
  state.friends = defaultFriends;
  state.cries = defaultCries;
  saveStorage(storageKeys.profile, state.profile);
  saveStorage(storageKeys.friends, state.friends);
  saveStorage(storageKeys.cries, state.cries);
  updateProfileChip();
  renderAuthorOptions();
  renderFriends();
  renderFeed();
  renderMap();
}

function initForms() {
  document.getElementById("profileName").value = state.profile.name;
  document.getElementById("profileHandle").value = state.profile.handle;
  document.getElementById("profileAvatar").value = state.profile.avatar;
}

bindTabs();
renderAuthorOptions();
renderFriends();
renderFeed();
renderMap();
updateProfileChip();
initForms();

elements.cryForm.addEventListener("submit", handleCrySubmit);
elements.profileForm.addEventListener("submit", handleProfileSubmit);
elements.friendForm.addEventListener("submit", handleFriendSubmit);
elements.seedData.addEventListener("click", seedSampleData);
