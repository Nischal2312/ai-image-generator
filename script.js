const themeToggle = document.querySelector(".theme-toggle");
const promptBtn = document.querySelector(".prompt-btn");
const promptInput = document.querySelector(".prompt-input");
const promptForm = document.querySelector(".prompt-form");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");
const HF_TOKEN = process.env.HF_TOKEN;
const examplePrompts = [  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
  "An underwater kingdom with merpeople and glowing coral buildings",
  "A floating island with waterfalls pouring into clouds below",
  "A witch's cottage in fall with magic herbs in the garden",
  "A robot painting in a sunny studio with art supplies around it",
  "A magical library with floating glowing books and spiral staircases",
  "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
  "A cosmic beach with glowing sand and an aurora in the night sky",
  "A medieval marketplace with colorful tents and street performers",
  "A cyberpunk city with neon signs and flying cars at night",
  "A peaceful bamboo forest with a hidden ancient temple",
  "A giant turtle carrying a village on its back in the ocean",
];

(()=> {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme:dark)").matches;
    const isDarkTheme = savedTheme==="dark" || (!savedTheme && systemPrefersDark);
    document.body.classList.toggle("dark-theme",isDarkTheme);
    const icon = themeToggle?.querySelector("i");
    if(icon) icon.className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();

const toggleTheme =() =>{
   const isDarkTheme = document.body.classList.toggle("dark-theme");
    const icon = themeToggle?.querySelector("i");
    if(icon) icon.className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
    localStorage.setItem("theme",isDarkTheme ? "dark":"light");
}

const getImageDimensions =(aspectRatio ,baseSize =512) =>{
    const [width,height] = aspectRatio.split("/").map(Number);
    const scaleFactor = baseSize/Math.sqrt(width * height);
    let caclulatedWidth = Math.round(width * scaleFactor);
    let caclulatedHeight = Math.round(height*scaleFactor);

    caclulatedWidth = Math.floor(caclulatedWidth/16) *16;
    caclulatedHeight = Math.floor(caclulatedHeight/16) *16;
    // ensure min size
    if (caclulatedWidth < 16) caclulatedWidth = 16;
    if (caclulatedHeight < 16) caclulatedHeight = 16;
    return {width : caclulatedWidth , height:caclulatedHeight};
}

const generateImages = async (selectedModel,imageCount,aspectRatio,promptText) =>{
    const MODEL_URL =`https://router.huggingface.co/hf-inference/models/${selectedModel}`
    const{width,height} = getImageDimensions(aspectRatio);

    const imagePromises = Array.from({length : imageCount}, async(_, i)=>{
       try {
        const response = await fetch (MODEL_URL,{
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                inputs: promptText,
                parameters : {width,height},
                options : {wait_for_model :true , use_cache: false},
            }),
        });

        if(!response.ok) {
            // try to get a helpful error message
            let errText = `HTTP ${response.status}`;
            try {
                const json = await response.json();
                if (json?.error) errText = json.error;
                else errText = JSON.stringify(json);
            } catch (e) {
                // not JSON — try text
                try { errText = await response.text(); } catch(e2) {}
            }
            throw new Error(errText);
        }

        // response is expected as binary image; handle both blob and base64-in-json cases
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            const json = await response.json();
            // try to extract base64 image (common HF response shape: { generated_images: ["data:image/png;base64,..."] })
            let b64 = null;
            if (Array.isArray(json?.generated_images) && json.generated_images[0]) {
                b64 = json.generated_images[0].split(",")[1];
            } else if (typeof json?.image === "string" && json.image.startsWith("data:")) {
                b64 = json.image.split(",")[1];
            }
            if (b64) {
                const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
                const blob = new Blob([bytes], { type: "image/png" });
                // put image into card
                const card = document.getElementById(`img-card-${i}`);
                if (card) {
                    const imgEl = card.querySelector(".result-img");
                    const statusText = card.querySelector(".status-text");
                    const url = URL.createObjectURL(blob);
                    imgEl.src = url;
                    imgEl.onload = () => URL.revokeObjectURL(url);
                    card.classList.remove("loading");
                    if (statusText) statusText.textContent = "Done";
                }
            } else {
                throw new Error("No image data in model JSON response");
            }
        } else {
            // binary blob case
            const resultBlob = await response.blob();
            const card = document.getElementById(`img-card-${i}`);
            if (card) {
                const imgEl = card.querySelector(".result-img");
                const statusText = card.querySelector(".status-text");
                const url = URL.createObjectURL(resultBlob);
                imgEl.src = url;
                imgEl.onload = () => URL.revokeObjectURL(url);
                card.classList.remove("loading");
                if (statusText) statusText.textContent = "Done";
            }
        }

    }

    catch(error){
        console.log(error);
        // update the specific card with error text
        const card = document.getElementById(`img-card-${i}`);
        if (card) {
            const statusText = card.querySelector(".status-text");
            if (statusText) statusText.textContent = "Error: " + (error.message || "unknown");
            card.classList.remove("loading");
            card.classList.add("error");
        }
    }
})
await Promise.allSettled(imagePromises);
};

const createImageCards = (selectedModel,imageCount,aspectRatio,promptText) =>{
     gridGallery.innerHTML="";
    for(let i=0;i<imageCount;i++)
    {
        gridGallery.innerHTML += `<div class="img-card loading" id="img-card-${i}" style="aspect-ratio:${aspectRatio}">
                        <div class="status-container">
                            <div class="spinner">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                                <p class="status-text">Generating...</p>

                            </div>
                        </div>
                        <img src="test.png" class="result-img" alt="generated image ${i}">
                       
                    </div>`;
    }
}

const handleFormSubmit=(e) =>{
    e.preventDefault();
    const selectedModel =modelSelect.value;
    const imageCount = parseInt(countSelect.value)|| 1;
    const aspectRatio = ratioSelect.value ||"1/1";
    const promptText = promptInput.value.trim();
    createImageCards(selectedModel,imageCount,aspectRatio,promptText);

    // call generate AFTER cards exist
    generateImages(selectedModel,imageCount,aspectRatio,promptText);
}


promptBtn.addEventListener("click", () => {
    const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    promptInput.value = prompt;
    promptInput.focus();

})
promptForm.addEventListener("submit",handleFormSubmit);
themeToggle.addEventListener("click",toggleTheme);
