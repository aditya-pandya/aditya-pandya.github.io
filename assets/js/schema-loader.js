document.addEventListener('DOMContentLoaded', function() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Aditya Pandya",
    "url": "https://aditya.pandya.co",
    "image": "https://aditya.pandya.co/assets/images/ap.jpeg",
    "jobTitle": "Product Leader & Advisor",
    "worksFor": {
      "@type": "Organization",
      "name": "Independent Advisor"
    },
    "alumniOf": [
      {
        "@type": "Organization",
        "name": "Indeed",
        "sameAs": "https://www.indeed.com/"
      },
      {
        "@type": "Organization",
        "name": "MakeMyTrip",
        "sameAs": "https://www.makemytrip.com/"
      },
      {
        "@type": "Organization",
        "name": "Directi",
        "sameAs": "https://www.directi.com/"
      },
      {
        "@type": "Organization",
        "name": "Narsee Monjee Institute of Management Studies",
        "sameAs": "https://www.nmims.edu/"
      }
    ],
    "knowsAbout": [
      "Product Management",
      "Marketplace Strategy",
      "AI/ML Product Development",
      "Team Leadership",
      "Revenue Growth",
      "User Experience Design",
      "Evidence-Driven Development",
      "A/B Testing",
      "Job Applications Platform",
      "Interview Scheduling",
      "Profile Optimization",
      "Global Team Management"
    ],
    "description": "Product leader with 15+ years experience driving transformational growth at Indeed, MakeMyTrip, and Directi. Scaled products to impact 100M+ people globally while generating $6B+ in revenue. Currently advising startups in HR Tech, Marketplaces, and Automotive sectors."
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(personSchema);
  document.head.appendChild(script);
});
