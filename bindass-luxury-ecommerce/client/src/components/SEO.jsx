import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEO = ({ title, description }) => {
    const location = useLocation();

    useEffect(() => {
        const baseTitle = "Bindass!! | Luxury Athletic Energy";
        document.title = title ? `${title} | Bindass!!` : baseTitle;

        if (description) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = "description";
                document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute('content', description);
        }
    }, [title, description, location]);

    return null;
};

export default SEO;
