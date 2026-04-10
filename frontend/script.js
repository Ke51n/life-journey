const LS_KEY = "lifeJournalStore"
const nowTs = () => new Date().toISOString()
function seed() {
  return {
    profile: {
      name: "KK",
      height: 175,
      weight: 70,
      zodiac: "双子座",
      mbti: "INTJ",
      photo: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&q=60"
    },
    people: [
      { id: "p1", name: "KK", type: "本人" },
      { id: "p2", name: "小李", type: "朋友" },
      { id: "p3", name: "父亲", type: "亲人" },
      { id: "p4", name: "导师王", type: "导师" }
    ],
    relationships: [
      { id: "r1", source: "p1", target: "p2", type: "朋友" },
      { id: "r2", source: "p1", target: "p3", type: "亲人" },
      { id: "r3", source: "p1", target: "p4", type: "师生" }
    ],
    records: [
      {
        id: "rec1",
        category: "技术文档",
        title: "关于 Agent 技术的博客",
        date: "2026-03-01",
        tags: ["技术", "Agent"],
        content: "总结近期对智能体技术的理解与实践。",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=60",
        video: ""
      },
      {
        id: "rec2",
        category: "健身",
        title: "力量训练第 12 周",
        date: "2026-02-20",
        tags: ["健身", "力量"],
        content: "深蹲 5x5，硬拉 3x5，卧推 5x5。",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=60",
        video: ""
      },
      {
        id: "rec3",
        category: "旅行",
        title: "杭州西湖春游",
        date: "2026-03-05",
        tags: ["旅行", "春日", "摄影"],
        content: "漫步苏堤、游船湖心，品龙井茶。",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=60",
        video: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        locations: [
          { lat: 30.243, lng: 120.150, label: "苏堤" },
          { lat: 30.243, lng: 120.137, label: "湖心亭" },
          { lat: 30.235, lng: 120.130, label: "龙井村" }
        ],
        itinerary: [
          { time: "09:00", activity: "苏堤步行" },
          { time: "11:00", activity: "游船湖心" },
          { time: "14:00", activity: "龙井村品茶" }
        ]
      },
      {
        id: "rec4",
        category: "美食",
        title: "尝试新烹饪方式：糖醋里脊",
        date: "2026-03-10",
        tags: ["日常", "美食", "技能"],
        content: "学习挂糊技巧与油温控制，成品外酥里嫩。",
        image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=800&q=60",
        video: ""
      }
    ],
    logs: [],
    undoStack: []
  }
}
function loadStore() {
  const raw = localStorage.getItem(LS_KEY)
  if (raw) return JSON.parse(raw)
  const s = seed()
  localStorage.setItem(LS_KEY, JSON.stringify(s))
  return s
}
function saveStore() {
  localStorage.setItem(LS_KEY, JSON.stringify(store))
}
let store = loadStore()
function pushLog(entry) {
  store.logs.unshift(entry)
  store.undoStack.push(entry)
  saveStore()
  renderLogs()
}

function renderProfile() {
  const p = store.profile
  document.getElementById("profilePhoto").src = p.photo || ""
  document.getElementById("profileName").textContent = p.name || ""
  document.getElementById("profileHeight").textContent = p.height ? p.height + " cm" : ""
  document.getElementById("profileWeight").textContent = p.weight ? p.weight + " kg" : ""
  document.getElementById("profileZodiac").textContent = p.zodiac || ""
  document.getElementById("profileMbti").textContent = p.mbti || ""
  const form = document.getElementById("profileForm")
  form.name.value = p.name || ""
  form.height.value = p.height || ""
  form.weight.value = p.weight || ""
  form.zodiac.value = p.zodiac || ""
  form.mbti.value = p.mbti || ""
  form.photo.value = p.photo || ""
}
function renderPeople() {
  const ul = document.getElementById("peopleList")
  ul.innerHTML = ""
  store.people.forEach(person => {
    const li = document.createElement("li")
    const left = document.createElement("div")
    left.textContent = person.name + " · " + (person.type || "")
    const right = document.createElement("div")
    const editBtn = document.createElement("button")
    editBtn.textContent = "编辑"
    editBtn.onclick = () => {
      const name = prompt("姓名", person.name) || person.name
      const type = prompt("类型", person.type) || person.type
      const before = JSON.parse(JSON.stringify(person))
      person.name = name
      person.type = type
      saveStore()
      pushLog({ ts: nowTs(), entity: "person", action: "update", before, after: JSON.parse(JSON.stringify(person)) })
      renderAll()
    }
    const delBtn = document.createElement("button")
    delBtn.textContent = "删除"
    delBtn.onclick = () => {
      const before = JSON.parse(JSON.stringify(person))
      store.people = store.people.filter(p => p.id !== person.id)
      store.relationships = store.relationships.filter(r => r.source !== person.id && r.target !== person.id)
      saveStore()
      pushLog({ ts: nowTs(), entity: "person", action: "delete", before, after: null })
      renderAll()
    }
    right.appendChild(editBtn)
    right.appendChild(delBtn)
    li.appendChild(left)
    li.appendChild(right)
    ul.appendChild(li)
  })
  const src = document.getElementById("relationSource")
  const tgt = document.getElementById("relationTarget")
  src.innerHTML = ""
  tgt.innerHTML = ""
  store.people.forEach(p => {
    const o1 = document.createElement("option")
    o1.value = p.id
    o1.textContent = p.name
    src.appendChild(o1)
    const o2 = document.createElement("option")
    o2.value = p.id
    o2.textContent = p.name
    tgt.appendChild(o2)
  })
}
function renderRelationsList() {
  const ul = document.getElementById("relationList")
  ul.innerHTML = ""
  store.relationships.forEach(rel => {
    const li = document.createElement("li")
    const s = store.people.find(p => p.id === rel.source)
    const t = store.people.find(p => p.id === rel.target)
    const left = document.createElement("div")
    left.textContent = (s ? s.name : rel.source) + " ⇄ " + (t ? t.name : rel.target) + " · " + rel.type
    const right = document.createElement("div")
    const delBtn = document.createElement("button")
    delBtn.textContent = "删除"
    delBtn.onclick = () => {
      const before = JSON.parse(JSON.stringify(rel))
      store.relationships = store.relationships.filter(r => r.id !== rel.id)
      saveStore()
      pushLog({ ts: nowTs(), entity: "relationship", action: "delete", before, after: null })
      renderAll()
    }
    right.appendChild(delBtn)
    li.appendChild(left)
    li.appendChild(right)
    ul.appendChild(li)
  })
}
function renderGraph() {
  const el = document.getElementById("graph")
  el.innerHTML = ""
  const width = el.clientWidth
  const height = el.clientHeight
  const svg = d3.select(el).append("svg").attr("width", width).attr("height", height)
  const nodes = store.people.map(p => ({ id: p.id, name: p.name, type: p.type }))
  const links = store.relationships.map(r => ({ source: r.source, target: r.target, type: r.type }))
  const color = d3.scaleOrdinal().domain(["本人","朋友","亲人","情侣","同事","导师"]).range(["#5b8cff","#7aa2f7","#a0e3a2","#ff7a90","#ffd166","#c6a0f6"])
  const sim = d3.forceSimulation(nodes).force("link", d3.forceLink(links).id(d => d.id).distance(120)).force("charge", d3.forceManyBody().strength(-240)).force("center", d3.forceCenter(width / 2, height / 2))
  const link = svg.append("g").selectAll("line").data(links).enter().append("line").attr("stroke", "#2c2f40").attr("stroke-width", 1.2)
  const node = svg.append("g").selectAll("g").data(nodes).enter().append("g").call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended))
  node.append("circle").attr("r", 14).attr("fill", d => color(d.type))
  node.append("text").text(d => d.name).attr("x", 18).attr("y", 5).attr("fill", "#e9ecf1").attr("font-size", 12)
  const linkLabel = svg.append("g").selectAll("text").data(links).enter().append("text").text(d => d.type).attr("fill", "#aab1bd").attr("font-size", 10)
  sim.on("tick", () => {
    link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y)
    node.attr("transform", d => "translate(" + d.x + "," + d.y + ")")
    linkLabel.attr("x", d => (d.source.x + d.target.x) / 2).attr("y", d => (d.source.y + d.target.y) / 2)
  })
  function dragstarted(event, d) { if (!event.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y }
  function dragged(event, d) { d.fx = event.x; d.fy = event.y }
  function dragended(event, d) { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null }
}
function renderRecords() {
  const grid = document.getElementById("recordGrid")
  grid.innerHTML = ""
  const cat = document.getElementById("categoryFilter").value
  const tag = document.getElementById("tagFilter").value.trim()
  let rs = store.records.slice().sort((a,b)=>new Date(b.date)-new Date(a.date))
  if (cat) rs = rs.filter(r => r.category === cat)
  if (tag) rs = rs.filter(r => (r.tags || []).some(t => t.includes(tag)))
  rs.forEach(r => {
    const card = document.createElement("div")
    card.className = "record-card"
    const title = document.createElement("div")
    title.innerHTML = "<strong>" + r.title + "</strong>"
    const meta = document.createElement("div")
    meta.className = "meta"
    meta.textContent = r.category + " · " + r.date + (r.tags && r.tags.length ? " · " + r.tags.join("、") : "")
    const content = document.createElement("div")
    content.textContent = r.content || ""
    card.appendChild(title)
    card.appendChild(meta)
    card.appendChild(content)
    if (r.image) {
      const img = document.createElement("img")
      img.src = r.image
      card.appendChild(img)
    }
    if (r.video) {
      const video = document.createElement("video")
      video.src = r.video
      video.controls = true
      card.appendChild(video)
    }
    const actions = document.createElement("div")
    const editBtn = document.createElement("button")
    editBtn.textContent = "编辑"
    editBtn.onclick = () => {
      const f = document.getElementById("recordForm")
      f.category.value = r.category
      f.title.value = r.title
      f.date.value = r.date
      f.tags.value = (r.tags || []).join(",")
      f.image.value = r.image || ""
      f.video.value = r.video || ""
      f.content.value = r.content || ""
      f.locations.value = (r.locations || []).map(l => l.lat + "," + l.lng).join("|")
      f.dataset.editId = r.id
    }
    const delBtn = document.createElement("button")
    delBtn.textContent = "删除"
    delBtn.onclick = () => {
      const before = JSON.parse(JSON.stringify(r))
      store.records = store.records.filter(x => x.id !== r.id)
      saveStore()
      pushLog({ ts: nowTs(), entity: "record", action: "delete", before, after: null })
      renderAll()
    }
    actions.appendChild(editBtn)
    actions.appendChild(delBtn)
    card.appendChild(actions)
    grid.appendChild(card)
  })
}
let travelMap = null
let currentTravel = null
function renderTravel() {
  const travels = store.records.filter(r => r.category === "旅行")
  const listEl = document.getElementById("travelList")
  const detailEl = document.getElementById("travelDetail")
  listEl.innerHTML = ""
  if (travels.length === 0) {
    listEl.innerHTML = '<div class="meta" style="color:var(--muted)">暂无旅行记录</div>'
    detailEl.classList.add("hidden")
    return
  }
  travels.forEach(t => {
    const card = document.createElement("div")
    card.className = "travel-card"
    const img = document.createElement("img")
    img.src = t.image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=60"
    img.alt = t.title
    const body = document.createElement("div")
    body.className = "travel-card-body"
    const title = document.createElement("h4")
    title.textContent = t.title
    const date = document.createElement("div")
    date.className = "date"
    date.textContent = t.date
    const locs = document.createElement("div")
    locs.className = "locations"
    locs.textContent = (t.locations || []).map(l => l.label).join(" → ") || "点击查看详情"
    body.appendChild(title)
    body.appendChild(date)
    body.appendChild(locs)
    card.appendChild(img)
    card.appendChild(body)
    card.onclick = () => showTravelDetail(t)
    listEl.appendChild(card)
  })
  listEl.classList.remove("hidden")
  detailEl.classList.add("hidden")
}
function showTravelDetail(travel) {
  currentTravel = travel
  const listEl = document.getElementById("travelList")
  const detailEl = document.getElementById("travelDetail")
  const mapEl = document.getElementById("travelMap")
  const titleEl = document.getElementById("travelTitle")
  const itinEl = document.getElementById("travelItinerary")
  const notesView = document.getElementById("travelNotesView")
  const notesEditor = document.getElementById("travelNotesEditor")
  listEl.classList.add("hidden")
  detailEl.classList.remove("hidden")
  titleEl.textContent = travel.title
  mapEl.innerHTML = ""
  if (travelMap) {
    travelMap.remove()
    travelMap = null
  }
  const center = travel.locations && travel.locations.length ? [travel.locations[0].lat, travel.locations[0].lng] : [30.243, 120.150]
  travelMap = L.map("travelMap").setView(center, 13)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "" }).addTo(travelMap)
  const locations = travel.locations || []
  locations.forEach((l, i) => {
    L.marker([l.lat, l.lng]).addTo(travelMap).bindPopup((i + 1) + ". " + (l.label || "地点"))
  })
  if (locations.length > 1) {
    const latlngs = locations.map(l => [l.lat, l.lng])
    L.polyline(latlngs, { color: '#2dd4bf', weight: 3, opacity: 0.8 }).addTo(travelMap)
    travelMap.fitBounds(L.latLngBounds(latlngs), { padding: [20, 20] })
  }
  itinEl.innerHTML = ""
  ;(travel.itinerary || []).forEach(i => {
    const div = document.createElement("div")
    div.className = "item"
    const t = document.createElement("div")
    t.textContent = i.time
    const a = document.createElement("div")
    a.textContent = i.activity
    div.appendChild(t)
    div.appendChild(a)
    itinEl.appendChild(div)
  })
  // Render notes
  const notes = travel.notes || ""
  notesView.innerHTML = notes ? marked.parse(notes) : '<span style="color:var(--muted)">暂无内容，点击编辑添加旅行感悟...</span>'
  notesEditor.value = notes
  // Reset editor state
  notesView.classList.remove("hidden")
  notesEditor.classList.add("hidden")
  document.getElementById("editNotesBtn").classList.remove("hidden")
  document.getElementById("saveNotesBtn").classList.add("hidden")
  document.getElementById("cancelNotesBtn").classList.add("hidden")
}
function hideTravelDetail() {
  const listEl = document.getElementById("travelList")
  const detailEl = document.getElementById("travelDetail")
  listEl.classList.remove("hidden")
  detailEl.classList.add("hidden")
  currentTravel = null
}
function editTravelNotes() {
  document.getElementById("travelNotesView").classList.add("hidden")
  document.getElementById("travelNotesEditor").classList.remove("hidden")
  document.getElementById("editNotesBtn").classList.add("hidden")
  document.getElementById("saveNotesBtn").classList.remove("hidden")
  document.getElementById("cancelNotesBtn").classList.remove("hidden")
}
function saveTravelNotes() {
  if (!currentTravel) return
  const notes = document.getElementById("travelNotesEditor").value
  currentTravel.notes = notes
  saveStore()
  document.getElementById("travelNotesView").innerHTML = notes ? marked.parse(notes) : '<span style="color:var(--muted)">暂无内容，点击编辑添加旅行感悟...</span>'
  document.getElementById("travelNotesView").classList.remove("hidden")
  document.getElementById("travelNotesEditor").classList.add("hidden")
  document.getElementById("editNotesBtn").classList.remove("hidden")
  document.getElementById("saveNotesBtn").classList.add("hidden")
  document.getElementById("cancelNotesBtn").classList.add("hidden")
}
function cancelTravelNotes() {
  document.getElementById("travelNotesEditor").value = currentTravel ? (currentTravel.notes || "") : ""
  document.getElementById("travelNotesView").classList.remove("hidden")
  document.getElementById("travelNotesEditor").classList.add("hidden")
  document.getElementById("editNotesBtn").classList.remove("hidden")
  document.getElementById("saveNotesBtn").classList.add("hidden")
  document.getElementById("cancelNotesBtn").classList.add("hidden")
}
function renderTimeline() {
  const view = document.getElementById("timelineView")
  view.innerHTML = ""
  const line = document.createElement("div")
  line.className = "timeline-line"
  view.appendChild(line)
  const container = document.createElement("div")
  container.className = "timeline-items"
  const sorted = store.records.slice().sort((a, b) => new Date(a.date) - new Date(b.date))
  const items = sorted.slice(-6)
  const count = items.length
  items.forEach((r, i) => {
    const item = document.createElement("div")
    item.className = "timeline-item " + (i % 2 === 0 ? "above" : "below")
    item.dataset.category = r.category
    const pct = count === 1 ? 50 : (i / (count - 1)) * 80 + 10
    item.style.left = `calc(${pct}% - 60px)`
    const connector = document.createElement("div")
    connector.className = "connector"
    const dot = document.createElement("div")
    dot.className = "dot"
    const date = document.createElement("div")
    date.className = "date"
    date.textContent = r.date
    const category = document.createElement("div")
    category.className = "category"
    category.textContent = r.category
    const title = document.createElement("div")
    title.className = "title"
    title.textContent = r.title
    item.appendChild(connector)
    item.appendChild(dot)
    item.appendChild(date)
    item.appendChild(category)
    item.appendChild(title)
    container.appendChild(item)
  })
  view.appendChild(container)
}
function renderLogs() {
  const ul = document.getElementById("logList")
  ul.innerHTML = ""
  store.logs.forEach(log => {
    const li = document.createElement("li")
    const left = document.createElement("div")
    left.textContent = log.ts + " · " + log.entity + " · " + log.action
    const right = document.createElement("div")
    li.appendChild(left)
    li.appendChild(right)
    ul.appendChild(li)
  })
}
function genId(prefix) { return prefix + Math.random().toString(36).slice(2,8) }
function setupEvents() {
  document.getElementById("travelBack").addEventListener("click", hideTravelDetail)
  document.getElementById("editNotesBtn").addEventListener("click", editTravelNotes)
  document.getElementById("saveNotesBtn").addEventListener("click", saveTravelNotes)
  document.getElementById("cancelNotesBtn").addEventListener("click", cancelTravelNotes)
  document.getElementById("profileForm").addEventListener("submit", e => {
    e.preventDefault()
    const f = e.target
    const before = JSON.parse(JSON.stringify(store.profile))
    store.profile = {
      name: f.name.value || "",
      height: f.height.value ? parseInt(f.height.value,10) : "",
      weight: f.weight.value ? parseInt(f.weight.value,10) : "",
      zodiac: f.zodiac.value || "",
      mbti: f.mbti.value || "",
      photo: f.photo.value || ""
    }
    saveStore()
    pushLog({ ts: nowTs(), entity: "profile", action: "update", before, after: JSON.parse(JSON.stringify(store.profile)) })
    renderAll()
  })
  document.getElementById("personForm").addEventListener("submit", e => {
    e.preventDefault()
    const f = e.target
    const person = { id: genId("p"), name: f.name.value.trim(), type: f.ptype.value }
    store.people.push(person)
    saveStore()
    pushLog({ ts: nowTs(), entity: "person", action: "create", before: null, after: JSON.parse(JSON.stringify(person)) })
    f.reset()
    renderAll()
  })
  document.getElementById("relationForm").addEventListener("submit", e => {
    e.preventDefault()
    const f = e.target
    if (f.source.value === f.target.value) return
    const rel = { id: genId("r"), source: f.source.value, target: f.target.value, type: f.rtype.value }
    store.relationships.push(rel)
    saveStore()
    pushLog({ ts: nowTs(), entity: "relationship", action: "create", before: null, after: JSON.parse(JSON.stringify(rel)) })
    renderAll()
  })
  document.getElementById("categoryFilter").addEventListener("change", renderRecords)
  document.getElementById("tagFilter").addEventListener("input", renderRecords)
  document.getElementById("recordForm").addEventListener("submit", e => {
    e.preventDefault()
    const f = e.target
    const tags = f.tags.value.trim() ? f.tags.value.split(",").map(s=>s.trim()).filter(Boolean) : []
    const locations = f.locations.value.trim() ? f.locations.value.split("|").map(s => {
      const [lat,lng] = s.split(",").map(Number)
      return { lat, lng }
    }) : []
    const payload = {
      category: f.category.value,
      title: f.title.value.trim(),
      date: f.date.value,
      tags,
      image: f.image.value.trim(),
      video: f.video.value.trim(),
      content: f.content.value.trim(),
      locations
    }
    if (f.dataset.editId) {
      const rec = store.records.find(r => r.id === f.dataset.editId)
      const before = JSON.parse(JSON.stringify(rec))
      Object.assign(rec, payload)
      saveStore()
      pushLog({ ts: nowTs(), entity: "record", action: "update", before, after: JSON.parse(JSON.stringify(rec)) })
      f.dataset.editId = ""
    } else {
      const rec = Object.assign({ id: genId("rec") }, payload)
      store.records.push(rec)
      saveStore()
      pushLog({ ts: nowTs(), entity: "record", action: "create", before: null, after: JSON.parse(JSON.stringify(rec)) })
    }
    f.reset()
    renderAll()
  })
  document.getElementById("undoBtn").addEventListener("click", () => {
    if (!store.undoStack.length) return
    const last = store.undoStack.pop()
    if (last.entity === "person") {
      if (last.action === "create") {
        store.people = store.people.filter(p => p.id !== last.after.id)
      } else if (last.action === "delete") {
        store.people.push(last.before)
      } else if (last.action === "update") {
        const p = store.people.find(x => x.id === last.before.id)
        if (p) Object.assign(p, last.before)
      }
    } else if (last.entity === "relationship") {
      if (last.action === "create") {
        store.relationships = store.relationships.filter(r => r.id !== last.after.id)
      } else if (last.action === "delete") {
        store.relationships.push(last.before)
      } else if (last.action === "update") {
        const r = store.relationships.find(x => x.id === last.before.id)
        if (r) Object.assign(r, last.before)
      }
    } else if (last.entity === "record") {
      if (last.action === "create") {
        store.records = store.records.filter(r => r.id !== last.after.id)
      } else if (last.action === "delete") {
        store.records.push(last.before)
      } else if (last.action === "update") {
        const r = store.records.find(x => x.id === last.before.id)
        if (r) Object.assign(r, last.before)
      }
    } else if (last.entity === "profile") {
      store.profile = last.before
    }
    saveStore()
    renderAll()
  })
}
function renderAll() {
  renderProfile()
  renderPeople()
  renderRelationsList()
  renderGraph()
  renderRecords()
  renderTravel()
  renderTimeline()
  renderLogs()
}
document.addEventListener("DOMContentLoaded", () => {
  setupEvents()
  renderAll()
})
