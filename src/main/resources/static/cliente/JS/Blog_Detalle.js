// blog-detalle.js
(function () {
  // Base de artículos (editá textos/paths a gusto)
  const POSTS = {
    "trochita": {
      title: "La Trochita: el Viejo Expreso Patagónico",
      date: "Actualizado: Oct 2025",
      hero: "../IMG/Turisticos/La_Trochita_Banner.jpg",
      cover: "../IMG/Turisticos/La_Trochita.jpeg",
      sections: [
        { h: "¿Qué es la Trochita?", p: "Es un tren a vapor de trocha angosta (75 cm) que data de 1922. Hoy recorre un tramo turístico desde la Estación Esquel hasta Nahuel Pan." },
        { h: "Duración y salidas", p: "El paseo dura 3 horas, con paradas para fotos y visita a artesanos. En temporada alta hay más frecuencias." },
        { h: "Tips útiles", ul: [
          "Comprar los pasajes con anticipación (alta demanda).",
          "Llevá abrigo: el clima cordillerano cambia rápido.",
          "Llegá con 30–40 min de margen para estacionar y sacar fotos."
        ] }
      ]
    },
    "la-hoya": {
      title: "Esquí y Nieve en el Cerro La Hoya",
      date: "Actualizado: Oct 2025",
      hero: "../IMG/Turisticos/La_Hoya_Banner.jpg",
      cover: "../IMG/Turisticos/La_Hoya.jpg",
      sections: [
        { h: "Nieve de calidad y temporada larga", p: "La orientación del centro de ski favorece la nieve polvo por más tiempo. Encontrás pistas para todos los niveles." },
        { h: "Servicios", ul: [
          "Escuela de esquí y snowboard.",
          "Alquiler de equipos.",
          "Paradores con gastronomía."
        ] },
        { h: "Mejor época", p: "De julio a septiembre suele ser el pico, siempre consultando partes diarios." }
      ]
    },
    "los-alerces": {
      title: "Parque Nacional Los Alerces",
      date: "Actualizado: Oct 2025",
      hero: "../IMG/Turisticos/PN_Alerces_Banner.jpg",
      cover: "../IMG/Turisticos/PN_Alerces.jpg",
      sections: [
        { h: "Patrimonio Mundial", p: "Declarado por la UNESCO, protege lagos de color verde esmeralda y alerces milenarios." },
        { h: "Imperdibles", ul: [
          "Lago Futalaufquen y miradores.",
          "Pasarela Río Arrayanes.",
          "Excursión al Alerzal Milenario (desde Puerto Chucao)."
        ] },
        { h: "Consejos", p: "Llevá efectivo para accesos, agua, protector solar y chequeá el estado de caminos." }
      ]
    },
    "gastronomia": {
      title: "Gastronomía Patagónica en Esquel",
      date: "Actualizado: Oct 2025",
      hero: "../IMG/Turisticos/Gastronomia.jpg",
      cover: "../IMG/Turisticos/Gastronomia.jpg",
      sections: [
        { h: "Sabores regionales", ul: [
          "Trucha y cordero patagónico.",
          "Frutos rojos (mermeladas, tartas, helados).",
          "Cervezas artesanales."
        ] },
        { h: "Reservas y horarios", p: "En temporada alta conviene reservar. Varios locales cierran los lunes; chequeá horarios." }
      ]
    },
    "aventura": {
      title: "Trekking & MTB cerca de Esquel",
      date: "Actualizado: Oct 2025",
      hero: "../IMG/Turisticos/Senderismo.jpg",
      cover: "../IMG/Turisticos/Senderismo.jpg",
      sections: [
        { h: "Rutas para todos", p: "Desde caminatas suaves por la Laguna La Zeta hasta circuitos técnicos de MTB en la zona del cerro." },
        { h: "Seguridad", ul: [
          "Avisá tu recorrido.",
          "Llevá abrigo, agua y linterna.",
          "Respeto por la fauna y la señalización."
        ] }
      ]
    },
    "centro": {
      title: "Paseo por el Centro de Esquel",
      date: "Actualizado: Oct 2025",
      hero: "../IMG/Turisticos/Centro_Esquel.jpg",
      cover: "../IMG/Turisticos/Centro_Esquel.jpg",
      sections: [
        { h: "Plan tranquilo", p: "Plaza, cafés, chocolaterías, feria de artesanos y museos. Ideal para una tarde sin apuro." },
        { h: "Souvenirs", p: "Artesanías en madera, tejidos y productos regionales para llevar un pedacito de la Patagonia." }
      ]
    }
  };

  // Helpers DOM
  const $ = (id) => document.getElementById(id);

  // Obtener slug
  const params = new URLSearchParams(location.search);
  const slug = params.get("post") || "trochita";
  const data = POSTS[slug];

  if (!data) {
    // Slug inválido -> volver al listado
    location.href = "Blog.html";
    return;
  }

  // Render hero/meta
  const hero = $("post-hero");
  hero.style.backgroundImage = `url('${data.hero}')`;
  $("post-title").textContent = data.title;
  $("post-meta").textContent = data.date;

  // Render cover
  const cover = $("post-cover");
  cover.src = data.cover;
  cover.alt = data.title;

  // Render contenido
  const container = $("post-content");
  data.sections.forEach(sec => {
    if (sec.h) {
      const h2 = document.createElement("h2");
      h2.textContent = sec.h;
      container.appendChild(h2);
    }
    if (sec.p) {
      const p = document.createElement("p");
      p.textContent = sec.p;
      container.appendChild(p);
    }
    if (sec.ul) {
      const ul = document.createElement("ul");
      sec.ul.forEach(t => {
        const li = document.createElement("li");
        li.textContent = t;
        ul.appendChild(li);
      });
      container.appendChild(ul);
    }
  });

  // Share links
  const shareText = encodeURIComponent(`${data.title} — Hotel Paraíso Azul`);
  const shareUrl  = encodeURIComponent(location.href);
  $("share-whatsapp").href = `https://wa.me/?text=${shareText}%20${shareUrl}`;
  $("share-twitter").href  = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
})();