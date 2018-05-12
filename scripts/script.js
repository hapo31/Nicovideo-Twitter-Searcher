(async () => {
  const href = location.href;
  const matches = href.match(/http:\/\/www.nicovideo.jp\/my\/mylist\/#\/(\d+)/);
  const token = getToken();
  if (!token) {
    console.error("トークン取れなかった");
    return;
  }
  const mylistId = matches != null ? matches[1] : null;
  const res = await getMylistItems(token, mylistId);
  const videos = res.mylistitem.map(v => v.item_data.video_id);
  const header = document.querySelector("#myContHead");
  const btn = document.createElement("button");
  btn.innerText = "マイリストをTwitterで検索";
  btn.onclick = () => {
    window.open(buildTwitterSearchQuery(videos));
  };

  header.appendChild(btn);

})();

function getToken() {
  const scripts = Array.from(document.getElementsByTagName("script"));
  // scriptタグの中から直接NicoAPI.tokenを抜き出す(うんち実装)
  const content = scripts.filter(element => element.textContent.length > 0).filter(content => content.textContent.indexOf("NicoAPI") >= 0)[0].textContent;
  const matches = content.match(/.*NicoAPI.token\s=\s\"([^\"]*)\";/);
  return matches[1];
}


async function getMylistItems(token, mylistId) {
  if (mylistId != null) {
    return await fetchMylist(token, mylistId);
  } else {
    return await fetchDeflist(token);
  }
}

async function fetchMylist(token, mylistId) {
  const form = new FormData();
  form.append("group_id", mylistId);
  form.append("token", token);
  const res = await fetch("http://www.nicovideo.jp/api/mylist/list", {
    method: "POST",
    credentials: "include",
    body: form
  });

  return await res.json();
}

async function fetchDeflist(token) {
  const form = new FormData();
  form.append("token", token);
  const res = await fetch("http://www.nicovideo.jp/api/deflist/list", {
    method: "POST",
    credentials: "include",
    body: form
  });

  return await res.json();
}

function buildTwitterSearchQuery(words) {
  return "https://twitter.com/search?q=" + encodeURIComponent(words.join(" OR "));
}