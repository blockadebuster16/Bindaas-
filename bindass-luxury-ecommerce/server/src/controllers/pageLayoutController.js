const PageLayout = require('../models/PageLayout');

// Helper default layout initializer
const getDefaultSectionsForPage = (pageKey) => {
    switch (pageKey) {
        case 'home':
            return [
                { id: 'sec-hero', type: 'hero_ad', title: 'Hero Banner', order: 1, enabled: true },
                { id: 'sec-split', type: 'split_ad', title: 'Split Banner Ad', order: 2, enabled: true },
                { id: 'sec-[#1]', type: 'ad_strip', title: 'Carousel Ad Strip', order: 3, enabled: true },
                { id: 'sec-[#2]', type: 'product_grid', title: 'New Arrivals', categoryFilter: 'new_arrivals', order: 4, enabled: true },
                { id: 'sec-[#3]', type: 'ad_break', title: 'Content Break Banner', order: 5, enabled: true },
                { id: 'sec-[#4]', type: 'product_grid', title: "Women's Collection", categoryFilter: 'womens_collection', order: 6, enabled: true },
                { id: 'sec-[#5]', type: 'heritage', title: 'Brand Heritage Story', order: 7, enabled: true },
                { id: 'sec-[#6]', type: 'recently_viewed', title: 'Recently Viewed', order: 8, enabled: true }
            ];
        case 'women':
            return [
                { id: 'sec-w-1', type: 'hero_ad', title: 'Womenswear Hero Banner', order: 1, enabled: true },
                { id: 'sec-w-2', type: 'product_grid', title: 'Featured Womenswear', categoryFilter: 'womens_collection', order: 2, enabled: true },
                { id: 'sec-w-3', type: 'ad_break', title: 'Womenswear Editorial Break', order: 3, enabled: true },
                { id: 'sec-w-4', type: 'product_grid', title: 'Womenswear Accessories & Apparel', categoryFilter: 'women_all', order: 4, enabled: true }
            ];
        default:
            return [
                { id: `sec-${pageKey}-1`, type: 'hero_ad', title: `${pageKey.toUpperCase()} Hero Banner`, order: 1, enabled: true },
                { id: `sec-${pageKey}-2`, type: 'product_grid', title: `${pageKey.toUpperCase()} Collection`, categoryFilter: pageKey, order: 2, enabled: true },
                { id: `sec-${pageKey}-3`, type: 'ad_break', title: `${pageKey.toUpperCase()} Editorial Break`, order: 3, enabled: true }
            ];
    }
};

// @route GET /api/page-layouts/:page
exports.getPageLayout = async (req, res) => {
    try {
        const { page } = req.params;
        let layout = await PageLayout.findOne({ page }).populate('sections.adId');

        if (!layout) {
            // Seed default layout
            layout = new PageLayout({
                page,
                title: page.charAt(0).toUpperCase() + page.slice(1) + ' Page',
                sections: getDefaultSectionsForPage(page)
            });
            await layout.save();
        }

        res.json(layout);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch page layout', error: error.message });
    }
};

// @route GET /api/page-layouts
exports.getAllPageLayouts = async (req, res) => {
    try {
        const pages = ['home', 'men', 'women', 'apparel', 'sports', 'classics'];
        const layouts = [];

        for (const p of pages) {
            let layout = await PageLayout.findOne({ page: p }).populate('sections.adId');
            if (!layout) {
                layout = new PageLayout({
                    page: p,
                    title: p.charAt(0).toUpperCase() + p.slice(1) + ' Page',
                    sections: getDefaultSectionsForPage(p)
                });
                await layout.save();
            }
            layouts.push(layout);
        }

        res.json(layouts);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch all page layouts', error: error.message });
    }
};

// @route PUT /api/page-layouts/:page
exports.updatePageLayout = async (req, res) => {
    try {
        const { page } = req.params;
        const { sections, title } = req.body;

        let layout = await PageLayout.findOne({ page });
        if (!layout) {
            layout = new PageLayout({ page, title: title || page, sections: sections || [] });
        } else {
            if (sections) layout.sections = sections;
            if (title) layout.title = title;
            layout.updatedAt = Date.now();
        }

        await layout.save();
        res.json(layout);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update page layout', error: error.message });
    }
};
