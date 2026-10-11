import React, { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'ADITHYA MECHNEXUS | Mechanical Engineering Digital Laboratory',
  description = 'Mechanical Engineering student portfolio of Adithya G — CAD/CAE, FEA Stress/Thermal, CFD Aerodynamics, PLC Industrial Automation, and AI × Engineering.',
  keywords = ['Mechanical Engineering', 'CAD', 'CAE', 'FEA', 'CFD', 'Thermal Analysis', 'PLC Automation', 'Adithya G'],
  ogImage = '/og-mechnexus.png',
}) => {
  useEffect(() => {
    document.title = title;

    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('description', description);
    setMetaTag('keywords', keywords.join(', '));
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage);
  }, [title, description, keywords, ogImage]);

  return null;
};
