document.addEventListener('DOMContentLoaded', function() {
  // Person Schema
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Aditya Pandya",
    "url": "https://aditya.pandya.co",
    "image": "https://aditya.pandya.co/assets/images/ap.jpeg",
    "jobTitle": "VP Product & Fractional CPO",  // Updated to target specific roles
    "sameAs": [
      "https://www.linkedin.com/in/adityapandya"
    ],
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
      "Global Team Management",
      "VP Product Leadership", 
      "Fractional Product Leadership",
      "Product Growth Strategy" 
    ],
    "description": "Senior product leader with 15+ years scaling products to $6B+ revenue and 100M+ users. Expertise in marketplaces, AI/ML, and growth. Available for VP roles and advisory opportunities."  // Updated to match SEO recommendation
  };
  
  // Professional Service Schema - NEW
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Aditya Pandya Product Advisory",
    "description": "Strategic product advisory services for startups and growth-stage companies",
    "provider": {
      "@type": "Person",
      "name": "Aditya Pandya"
    },
    "serviceType": ["Product Strategy", "Growth Advisory", "Team Building", "Marketplace Optimization", "AI Product Development"],
    "areaServed": "Global"
  };
  
  // Add Person Schema
  const personScript = document.createElement('script');
  personScript.type = 'application/ld+json';
  personScript.textContent = JSON.stringify(personSchema);
  document.head.appendChild(personScript);
  
  // Add Service Schema
  const serviceScript = document.createElement('script');
  serviceScript.type = 'application/ld+json';
  serviceScript.textContent = JSON.stringify(serviceSchema);
  document.head.appendChild(serviceScript);
});
