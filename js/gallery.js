/* ==========================================================
   gallery.js
   Portfolio Gallery Renderer
   ========================================================== */

const gallery = document.getElementById("portfolio-gallery");

animations.forEach((project, index) => {

    const section = document.createElement("section");
    section.className = `project ${index % 2 === 0 ? "left" : "right"}`;

    section.innerHTML = `
        <video
            autoplay
            muted
            loop
            playsinline
            preload="metadata">

            <source src="${project.video}" type="video/mp4">

        </video>

        <div class="project-info">

            <h2>${project.title}</h2>

            <p>${project.description}</p>

            <div class="project-meta">

                ${project.year
            ? `<span>${project.year}</span>`
            : ""
        }

                ${project.software
            ? `<span>${project.software}</span>`
            : ""
        }

                ${project.duration
            ? `<span>${project.duration}</span>`
            : ""
        }

                ${project.role
            ? `<span>${project.role}</span>`
            : ""
        }

            </div>

        </div>
    `;

    gallery.appendChild(section);

});

/* ----------------------------------------------------------
   Lazy playback
---------------------------------------------------------- */

const observer = new IntersectionObserver(

    (entries) => {

        entries.forEach(entry => {

            const video = entry.target;

            if (entry.isIntersecting) {

                video.play();

            } else {

                video.pause();

            }

        });

    },

    {
        threshold: 0.35
    }

);

document.querySelectorAll("video").forEach(video => {

    observer.observe(video);

});

/* ----------------------------------------------------------
   Status Bar
---------------------------------------------------------- */

const statusFields = document.querySelectorAll(".status-bar-field");

if (statusFields.length > 0) {

    statusFields[0].textContent =
        `${animations.length} Projects`;

}