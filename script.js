const isIphone = () =>
    /iPhone/.test(navigator.userAgent) &&
    !window.MSStream &&
    (navigator.maxTouchPoints || 0) > 0;

//Handle Header
function handleHeaderWithAutoHide() {
    const header = document.querySelector("header");
    const ticker = document.getElementById("ticker");
    const stickySubscribeForm = document.querySelector(".sticky-subscribe-form .sticky");

    const updateHeaderHeight = () => {
        // Calculate header height based on ticker visibility
        let headerHeight = header.clientHeight;
        if (ticker && ticker.dataset.visible === "hidden") {
            // If ticker is hidden, subtract its height from total header height
            headerHeight = header.clientHeight;
        }
        return headerHeight;
    };

    let headerHeight = updateHeaderHeight();
    let oldScrollY = window.scrollY;

    const updatePositions = () => {
        headerHeight = updateHeaderHeight();

        // Update ticker position
        if (ticker && ticker.dataset.visible !== "hidden") {
            ticker.style.transform = `translateY(${headerHeight}px)`;
        }

        // Update sticky form position
        if (stickySubscribeForm) {
            stickySubscribeForm.style.top = `${headerHeight + 16}px`;
        }
    };

    // Initialize positions
    updatePositions();

    window.addEventListener("scroll", (e) => {
        const isScrollingDown = oldScrollY < window.scrollY;
        const shouldHideHeader = window.scrollY >= headerHeight;

        if (isScrollingDown) {
            if (shouldHideHeader) {
                header.style.transform = "translateY(-100%)";
                if (ticker && ticker.dataset.visible !== "hidden") {
                    ticker.style.transform = "translateY(0)";
                }
                if (stickySubscribeForm) stickySubscribeForm.style.top = "16px";
            } else {
                header.style.transform = "translateY(0)";
                if (ticker && ticker.dataset.visible !== "hidden") {
                    ticker.style.transform = `translateY(${headerHeight}px)`;
                }
                if (stickySubscribeForm) stickySubscribeForm.style.top = `${headerHeight + 16}px`;
            }
        } else {
            header.style.transform = "translateY(0)";
            if (ticker && ticker.dataset.visible !== "hidden") {
                ticker.style.transform = `translateY(${headerHeight}px)`;
            }
            if (stickySubscribeForm) stickySubscribeForm.style.top = `${headerHeight + 16}px`;
        }

        oldScrollY = window.scrollY;
    });

    // Return the update function so it can be called from handleTicker
    return updatePositions;
}

function handleHeader() {
    const header = document.querySelector("header");
    const ticker = document.getElementById("ticker");
    const stickySubscribeForm = document.querySelector(".sticky-subscribe-form .sticky");

    // Create the global updateHeaderPositions function
    window.updateHeaderPositions = function() {
        const headerHeight = header.clientHeight;

        // Always keep header at top
        header.style.top = "0px";
        header.style.transform = "translateY(0)";

        // Position ticker below header if visible
        if (ticker && ticker.dataset.visible === "visible") {
            ticker.style.top = `${headerHeight}px`;
            ticker.style.transform = "translateY(0)";
        }

        // Update sticky form position if it exists
        if (stickySubscribeForm) {
            stickySubscribeForm.style.top = `${headerHeight + 16}px`;
        }
    };

    // Initialize positions
    window.updateHeaderPositions();

    // Update positions on window resize
    window.addEventListener("resize", () => {
        window.updateHeaderPositions();
    });
}

function handleTicker() {
    const ticker = document.getElementById("ticker");
    if (ticker) {
        const tickerVisibility = localStorage.getItem("ticker");
        if (tickerVisibility === "hidden" || tickerVisibility === "visible") {
            ticker.dataset.visible = tickerVisibility;
            localStorage.setItem("ticker", tickerVisibility);
        }

        const closeTicker = document.getElementById("close-ticker");
        if (closeTicker) {
            closeTicker.addEventListener("click", () => {
                ticker.dataset.visible = "hidden";
                localStorage.setItem("ticker", "hidden");

                // Update header positions after ticker is hidden
                setTimeout(() => {
                    if (window.updateHeaderPositions) {
                        window.updateHeaderPositions();
                    }
                }, 10);
            });
        }

        const scrollers = document.querySelectorAll(".scroller");
        const infiniteScrollAnimation = () => {
            scrollers.forEach((scroller) => {
                const scrollerInner = scroller.querySelector(".scroller-inner");
                const scrollerContent = Array.from(scrollerInner.children);
                scrollerContent.forEach((el) => {
                    const duplicatedItem = el.cloneNode(true);
                    scrollerInner.appendChild(duplicatedItem);
                });
            });
        };
        infiniteScrollAnimation();
    }
}

//Handle Mobile Navigation
function handleMobileNavigation() {
    const mobileNav = document.getElementById("mobile-nav");
    mobileNav.addEventListener("click", () => {
        if (mobileNav.dataset.open === "true") {
            mobileNav.setAttribute("data-open", "false");
            document.body.classList.remove("no-scroll");
        } else {
            mobileNav.setAttribute("data-open", "true");
            document.body.classList.add("no-scroll");
        }
    });
}
//Handle Dropdowns
function handleDropdown() {
    const dropdowns = document.querySelectorAll(".dropdown");
    const langSwitcher = document.getElementById("lang-switcher");

    // Create array of all dropdown elements (including lang-switcher)
    const allDropdowns = [...dropdowns];
    if (langSwitcher) {
        allDropdowns.push(langSwitcher);
    }

    const toggleDropdown = (dropdown) => {
        if (dropdown.dataset.open === "true") {
            dropdown.setAttribute("data-open", "false");
        } else {
            // Close all other dropdowns first (including lang-switcher)
            allDropdowns.forEach(otherDropdown => {
                if (otherDropdown !== dropdown) {
                    otherDropdown.setAttribute("data-open", "false");
                }
            });
            dropdown.setAttribute("data-open", "true");
        }
    };
    dropdowns.forEach((dropdown) => {
        dropdown.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleDropdown(dropdown);
        });
    });
    // Close dropdowns when clicking outside
    document.addEventListener("click", (e) => {
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.setAttribute("data-open", "false");
            }
        });
    });
    // Close dropdowns with Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            dropdowns.forEach(dropdown => {
                dropdown.setAttribute("data-open", "false");
            });
        }
    });
}

//Secondary dropdown menu
function handleSecondaryDropdownArchived(){
    const categoryContainer = document.getElementById("category-container");
    const secDropdownMenu = document.querySelectorAll(".secondary-dropdown-menu");
    const positionMenu = (menu, dist) => {
        const parent = menu.parentElement;
        const offset = parent.offsetWidth / 2;
        if (
            dist + parent.offsetWidth - offset < 0 ||
            dist > window.innerWidth - offset
        ) {
            menu.parentElement.dataset.open = "false";
        } else if (dist + menu.offsetWidth > window.innerWidth) {
            menu.style.left = `${window.innerWidth - menu.offsetWidth}px`;
        } else if (dist + parent.offsetWidth > 0) {
            menu.style.left = `${Math.max(0, dist)}px`;
        } else {
            menu.style.left = `${dist}px`;
        }
    };
    secDropdownMenu.forEach((menu) => {
        const secondaryDropdown = menu.parentElement;
        secondaryDropdown.addEventListener("click", () => {
            positionMenu(
                menu,
                secondaryDropdown.offsetLeft - categoryContainer.scrollLeft
            );
        });
        //comment if issues
        categoryContainer.addEventListener("scroll", () => {
            positionMenu(
                menu,
                secondaryDropdown.offsetLeft - categoryContainer.scrollLeft
            );
        });

        document.addEventListener("click", (e) => {
            if (!secondaryDropdown.contains(e.target)) {
                secondaryDropdown.setAttribute("data-open", "false");
            }
        });
    });
}

function handleSecondaryDropdown(){
    const categoryContainer = document.getElementById("category-container");
    const secDropdownMenu = document.querySelectorAll(".secondary-dropdown-menu");
    const positionMenu = (menu) => {
        const parent = menu.parentElement;
        const parentRect = parent.getBoundingClientRect();
        const menuWidth = menu.offsetWidth;
        const maxLeft = Math.max(0, window.innerWidth - menuWidth);
        const clampedLeft = Math.min(Math.max(parentRect.left, 0), maxLeft);
        menu.style.left = `${clampedLeft}px`;
    };
    secDropdownMenu.forEach((menu) => {
        const secondaryDropdown = menu.parentElement;
        secondaryDropdown.addEventListener("click", () => {
            positionMenu(menu);
            // iOS fix: avoid clipping fixed dropdown inside scrollable container
            const isOpen = secondaryDropdown.dataset.open === "true";
            const savedScrollLeft = categoryContainer.scrollLeft;
            if (isIphone()) {
                categoryContainer.style.overflow = isOpen ? "visible" : "";
                requestAnimationFrame(() => {
                    categoryContainer.scrollLeft = savedScrollLeft;
                });
            } else {
                categoryContainer.style.overflow = isOpen ? "scroll" : "";
            }
        });
        //comment if issues
        categoryContainer.addEventListener("scroll", () => {
            positionMenu(menu);
        });

        document.addEventListener("click", (e) => {
            if (!secondaryDropdown.contains(e.target)) {
                secondaryDropdown.setAttribute("data-open", "false");
                const savedScrollLeft = categoryContainer.scrollLeft;
                categoryContainer.style.overflow = "";
                requestAnimationFrame(() => {
                    categoryContainer.scrollLeft = savedScrollLeft;
                });
            }
        });
    });
}

//Transform Secondary Navigation
function transformSecondaryNavigation() {
    const categoryContainer = document.getElementById("category-container");
    if (!categoryContainer) {
        console.warn('Category container not found');
        return false;
    }

    const navigationUl = categoryContainer.querySelector('ul');
    if (!navigationUl) {
        console.warn('Secondary navigation ul not found');
        return false;
    }

    const navigationItems = navigationUl.querySelectorAll('li');
    if (!navigationItems.length) {
        console.warn('No secondary navigation items found');
        return false;
    }

    try {
        const items = extractSecondaryNavigationItems(navigationItems);
        if (!items.length) {
            console.warn('No secondary navigation items extracted');
            return false;
        }

        const menuItems = parseSecondaryNavigationStructure(items, 'header');
        navigationUl.innerHTML = generateSecondaryNavigationHTML(menuItems);

        return true;
    } catch (error) {
        console.error('Secondary navigation transformation failed:', error);
        return false;
    }
}

//Extract Secondary Navigation Items
function extractSecondaryNavigationItems(navigationItems) {
    try {
        return Array.from(navigationItems).map(item => {
            const link = item.querySelector('a');
            if (!link) return null;

            const originalTitle = link.getAttribute('title') || '';
            // Clean title: remove [h], [f], +, and - prefixes
            const cleanTitle = cleanTitleAttribute(originalTitle);

            const originalLabel = sanitizeText(link.getAttribute('aria-label') || link.textContent || '');

            return {
                element: item,
                link: link,
                label: originalLabel,
                href: link.getAttribute('href') || '#',
                target: link.getAttribute('target'),
                rel: link.getAttribute('rel'),
                className: item.className || '',
                title: cleanTitle
            };
        }).filter(Boolean);
    } catch (error) {
        console.error('Error extracting secondary navigation items:', error);
        return [];
    }
}

//Parse Secondary Navigation Structure
function parseSecondaryNavigationStructure(items, location = 'header') {
    const menuItems = [];
    let currentDropdown = null;
    let dropdownCounter = 1;

    for (const item of items) {
        try {
            const { label, href } = item;

            if (!label.trim()) continue;

            // Parse visibility flags and clean the label
            const { cleanLabel, showInHeader, showInFooter } = parseMenuVisibility(label);

            // Skip items based on location visibility
            if (location === 'header' && !showInHeader) continue;
            if (location === 'footer' && !showInFooter) continue;

            // Handle headings (href="#" and doesn't start with + or -)
            if (href === '#' && !cleanLabel.startsWith('+') && !cleanLabel.startsWith('-')) {
                // Headings are only shown in footer, skip for header
                if (location === 'header') {
                    currentDropdown = null;
                    continue;
                }
                // Reset current dropdown when encountering a heading in footer
                currentDropdown = null;
                continue;
            }

            // Handle dropdown parent (starts with "+")
            if (cleanLabel.startsWith('+')) {
                const dropdownText = cleanLabel.substring(1).trim();
                if (!dropdownText) continue;

                currentDropdown = {
                    type: 'dropdown',
                    parent: {
                        text: dropdownText,
                        id: `${location}-dropdown-${dropdownCounter++}`,
                        className: item.className,
                        title: item.title,
                        href: item.href,
                        target: item.target,
                        rel: item.rel
                    },
                    children: []
                };
                menuItems.push(currentDropdown);
                continue;
            }

            // Handle dropdown child (starts with "-")
            if (cleanLabel.startsWith('-')) {
                const childText = cleanLabel.substring(1).trim();
                if (!childText) continue;

                if (!currentDropdown) {
                    console.warn('Dropdown child found without parent, converting to regular link:', cleanLabel);
                    menuItems.push({
                        type: 'link',
                        text: childText,
                        href: item.href,
                        target: item.target,
                        rel: item.rel,
                        className: item.className,
                        title: item.title
                    });
                    continue;
                }

                currentDropdown.children.push({
                    text: childText,
                    href: item.href,
                    target: item.target,
                    rel: item.rel,
                    className: item.className,
                    title: item.title
                });
                continue;
            }

            // Handle regular link
            if (cleanLabel.trim()) {
                menuItems.push({
                    type: 'link',
                    text: cleanLabel,
                    href: item.href,
                    target: item.target,
                    rel: item.rel,
                    className: item.className,
                    title: item.title
                });
            }

            // Reset current dropdown for regular links
            currentDropdown = null;

        } catch (error) {
            console.error('Error processing secondary navigation item:', error, item);
        }
    }
    return menuItems;
}

//Generate Secondary Navigation HTML
function generateSecondaryNavigationHTML(menuItems) {
    const itemsHTML = menuItems.map(item => {
        if (item.type === 'dropdown') {
            const childrenHTML = item.children.map(child => {
                const targetAttr = child.target ? ` target="${escapeHtml(child.target)}"` : '';
                const relAttr = child.rel ? ` rel="${escapeHtml(child.rel)}"` : '';
                const titleAttr = child.title ? ` title="${escapeHtml(child.title)}"` : '';

                return `<li><a href="${escapeHtml(child.href)}"${targetAttr}${relAttr}${titleAttr} class="inline-block w-full text-[--text-secondary] hover:text-[--text-primary] px-4 py-2">${escapeHtml(child.text)}</a></li>`;
            }).join('');

            if (!childrenHTML) {
                // If no children, render as regular link
                const targetAttr = item.parent.target ? ` target="${escapeHtml(item.parent.target)}"` : '';
                const relAttr = item.parent.rel ? ` rel="${escapeHtml(item.parent.rel)}"` : '';
                const titleAttr = item.parent.title ? ` title="${escapeHtml(item.parent.title)}"` : '';

                return `<li><a href="${escapeHtml(item.parent.href)}"${targetAttr}${relAttr}${titleAttr} class="text-[--text-primary]">${escapeHtml(item.parent.text)}</a></li>`;
            }

            const titleAttr = item.parent.title ? ` title="${escapeHtml(item.parent.title)}"` : '';

            return `<li data-open="false" class="dropdown secondary-dropdown w-max cursor-pointer relative group flex items-center z-0 h-full" aria-label="dropdown">
                <button class="w-auto flex items-center justify-between gap-2"${titleAttr}>
                    <span class="text-[--text-primary]">${escapeHtml(item.parent.text)}</span>
                    <img src="/assets/img/arrow.svg" alt="arrow" aria-hidden="true" class="block filter-theme h-3.5 group-data-[open='true']:rotate-180 transition-transform duration-300" />
                </button>
                <div class="block absolute top-0 left-0 h-full w-full"></div>
                <div class="pt-4 secondary-dropdown-menu fixed left-0 top-[calc(8.125rem_-_1px)]">
                    <ul class="rounded-sm flex flex-col gap-0 font-medium text-sm bg-[--header-bg] border border-[--border-color] w-max min-w-36">
                        ${childrenHTML}
                    </ul>
                </div>
            </li>`;
        } else {
            // Regular link
            const targetAttr = item.target ? ` target="${escapeHtml(item.target)}"` : '';
            const relAttr = item.rel ? ` rel="${escapeHtml(item.rel)}"` : '';
            const titleAttr = item.title ? ` title="${escapeHtml(item.title)}"` : '';

            return `<li><a href="${escapeHtml(item.href)}"${targetAttr}${relAttr}${titleAttr} class="text-[--text-primary]">${escapeHtml(item.text)}</a></li>`;
        }
    }).join('\n');

    return itemsHTML;
}

//Transform Footer Navigation
function transformFooterNavigation() {
    const footerNavContainer = document.querySelector('.footer-nav');
    if (!footerNavContainer) {
        console.warn('Footer navigation container not found');
        return false;
    }

    // Ghost renders navigation items directly as <li> elements in the container
    const navigationItems = footerNavContainer.querySelectorAll('li');
    if (!navigationItems.length) {
        console.warn('No footer navigation items found');
        return false;
    }

    try {
        const items = extractNavigationItemsFromLi(navigationItems);
        if (!items.length) {
            console.warn('No navigation items found');
            return false;
        }

        const columns = parseNavigationStructure(items, 'footer');
        if (!columns.length) {
            console.warn('No valid navigation structure found');
            return false;
        }

        const newHTML = generateFooterHTML(columns);
        footerNavContainer.innerHTML = newHTML;

        return true;
    } catch (error) {
        console.error('Footer navigation transformation failed:', error);
        return false;
    }
}

//Extract Navigation Items from Li elements
function extractNavigationItemsFromLi(navigationItems) {
    try {
        return Array.from(navigationItems).map(item => {
            const link = item.querySelector('a');
            if (!link) return null;

            const originalTitle = link.getAttribute('title') || '';
            // Clean title: remove [h], [f], +, and - prefixes
            const cleanTitle = cleanTitleAttribute(originalTitle);

            const originalLabel = sanitizeText(link.getAttribute('aria-label') || link.textContent || '');

            return {
                element: item,
                link: link,
                label: originalLabel,
                href: link.getAttribute('href') || '#',
                target: link.getAttribute('target'),
                rel: link.getAttribute('rel'),
                className: item.className || '',
                title: cleanTitle
            };
        }).filter(Boolean);
    } catch (error) {
        console.error('Error extracting navigation items:', error);
        return [];
    }
}

//Parse Navigation Structure
function parseNavigationStructure(items, location = 'footer') {
    const columns = [];
    let currentColumn = null;
    let currentDropdown = null;
    let dropdownCounter = 1;
    const maxColumns = 4;
    let hasRegularItems = false;

    for (const item of items) {
        try {
            const { label, href } = item;

            if (!label.trim()) continue;

            // Parse visibility flags and clean the label
            const { cleanLabel, showInHeader, showInFooter } = parseMenuVisibility(label);

            // Skip items based on location visibility
            if (location === 'header' && !showInHeader) continue;
            if (location === 'footer' && !showInFooter) continue;

            // Check if it's a heading (href="#" and doesn't start with + or -)
            if (href === '#' && !cleanLabel.startsWith('+') && !cleanLabel.startsWith('-')) {
                // Headings are always shown in footer regardless of [h] prefix
                if (location === 'header') continue;

                if (columns.length >= maxColumns) {
                    console.warn(`Maximum ${maxColumns} columns reached, skipping additional headings`);
                    continue;
                }

                currentColumn = {
                    heading: {
                        text: cleanLabel,
                        className: item.className,
                        title: item.title
                    },
                    items: []
                };
                columns.push(currentColumn);
                currentDropdown = null;
                continue;
            }

            // If no heading exists yet, create a default column for regular items
            if (!currentColumn) {
                currentColumn = {
                    heading: null, // No heading for regular items
                    items: []
                };
                columns.push(currentColumn);
                hasRegularItems = true;
            }

            // Handle dropdown parent (starts with "+")
            if (cleanLabel.startsWith('+')) {
                const dropdownText = cleanLabel.substring(1).trim();
                if (!dropdownText) continue;

                currentDropdown = {
                    type: 'dropdown',
                    parent: {
                        text: dropdownText,
                        id: `${location}-dropdown-${dropdownCounter++}`,
                        className: item.className,
                        title: item.title
                    },
                    children: []
                };
                currentColumn.items.push(currentDropdown);
                continue;
            }

            // Handle dropdown child (starts with "-")
            if (cleanLabel.startsWith('-')) {
                const childText = cleanLabel.substring(1).trim();
                if (!childText) continue;

                if (!currentDropdown) {
                    console.warn('Dropdown child found without parent, converting to regular link:', cleanLabel);
                    currentColumn.items.push({
                        type: 'link',
                        text: childText,
                        href: item.href,
                        target: item.target,
                        rel: item.rel,
                        className: item.className,
                        title: item.title
                    });
                    continue;
                }

                currentDropdown.children.push({
                    text: childText,
                    href: item.href,
                    target: item.target,
                    rel: item.rel,
                    className: item.className,
                    title: item.title
                });
                continue;
            }

            // Handle regular link
            if (cleanLabel.trim()) {
                currentColumn.items.push({
                    type: 'link',
                    text: cleanLabel,
                    href: item.href,
                    target: item.target,
                    rel: item.rel,
                    className: item.className,
                    title: item.title
                });
            }

            currentDropdown = null;

        } catch (error) {
            console.error('Error processing navigation item:', error, item);
            continue;
        }
    }

    return columns.filter(column => column.items.length > 0);
}

//Parse Menu Visibility - New Function
function parseMenuVisibility(label) {
    if (!label || typeof label !== 'string') {
        return {
            cleanLabel: '',
            showInHeader: true,
            showInFooter: true
        };
    }

    let cleanLabel = label.trim();
    let showInHeader = true;
    let showInFooter = true;

    // Check for [h] and [f] prefixes
    const headerMatch = cleanLabel.match(/^\[h\](.*)$/);
    const footerMatch = cleanLabel.match(/^\[f\](.*)$/);

    if (headerMatch) {
        // [h] prefix - show only in header
        cleanLabel = headerMatch[1].trim();
        showInHeader = true;
        showInFooter = false;
    } else if (footerMatch) {
        // [f] prefix - show only in footer
        cleanLabel = footerMatch[1].trim();
        showInHeader = false;
        showInFooter = true;
    }
    // If neither [h] nor [f] is present, show in both locations (default behavior)

    return {
        cleanLabel,
        showInHeader,
        showInFooter
    };
}

//Generate Footer HTML
function generateFooterHTML(columns) {
    const svgIcon = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" stroke-width="10" class="block h-3.5 rotate-180 transition-transform duration-300 stroke-[--footer-text] group-has-[:checked]:stroke-[--footer-text-hover] group-has-[:checked]:rotate-0">
        <g stroke-width="0"></g>
        <g stroke-linecap="round" stroke-linejoin="round"></g>
        <g><path d="M78.466,35.559L50.15,63.633L22.078,35.317c-0.777-0.785-2.044-0.789-2.828-0.012s-0.789,2.044-0.012,2.827L48.432,67.58 c0.365,0.368,0.835,0.563,1.312,0.589c0.139,0.008,0.278-0.001,0.415-0.021c0.054,0.008,0.106,0.021,0.16,0.022 c0.544,0.029,1.099-0.162,1.515-0.576l29.447-29.196c0.785-0.777,0.79-2.043,0.012-2.828S79.249,34.781,78.466,35.559z"></path></g>
    </svg>`;

    const columnsHTML = columns.map(column => {
        const itemsHTML = column.items.map(item => {
            if (item.type === 'dropdown') {
                const childrenHTML = item.children.map(child => {
                    const targetAttr = child.target ? ` target="${escapeHtml(child.target)}"` : '';
                    const relAttr = child.rel ? ` rel="${escapeHtml(child.rel)}"` : '';
                    const titleAttr = child.title ? ` title="${escapeHtml(child.title)}"` : '';

                    return `<li><a href="${escapeHtml(child.href)}"${targetAttr}${relAttr}${titleAttr} class="inline-block bg-transparent hover:bg-[#505050] text-white px-4 py-2 text-xs w-full">${escapeHtml(child.text)}</a></li>`;
                }).join('');

                if (!childrenHTML) {
                    return `<li><span class="text-[--footer-text]">${escapeHtml(item.parent.text)}</span></li>`;
                }

                const titleAttr = item.parent.title ? ` title="${escapeHtml(item.parent.title)}"` : '';

                return `<li class="group relative footer-dropdown-container origin-bottom">
                    <label for="${item.parent.id}" class="flex gap-2 items-center cursor-pointer"${titleAttr}>
                        <input type="checkbox" name="footer-dropdown" id="${item.parent.id}" class="hidden"/>
                        <div class="text-[--footer-text] group-has-[:checked]:text-[--footer-text-hover]">
                            ${escapeHtml(item.parent.text)}
                        </div>
                        ${svgIcon}
                    </label>
                    <div class="grid group-has-[:checked]:grid-rows-[1fr] grid-rows-[0fr] [transition:grid-template-rows_ease-in-out_300ms] absolute bottom-[calc(100%+0.625rem)] left-0">
                        <div class="overflow-hidden w-max">
                            <ul class="text-xs font-medium flex flex-col border border-[--footer-border] w-max min-w-28 bg-[--footer-dropdown] rounded-sm">
                                ${childrenHTML}
                            </ul>
                        </div>
                    </div>
                </li>`;
            } else {
                const targetAttr = item.target ? ` target="${escapeHtml(item.target)}"` : '';
                const relAttr = item.rel ? ` rel="${escapeHtml(item.rel)}"` : '';
                const titleAttr = item.title ? ` title="${escapeHtml(item.title)}"` : '';

                return `<li><a href="${escapeHtml(item.href)}"${targetAttr}${relAttr}${titleAttr} class="text-[--footer-text] hover:text-[--footer-text-hover]">${escapeHtml(item.text)}</a></li>`;
            }
        }).join('');

        // Handle columns without headings (regular items only)
        if (!column.heading) {
            return `<div class="footer-column">
                <ul class="footer-nav text-sm font-medium flex flex-col gap-2.5">
                    ${itemsHTML}
                </ul>
            </div>`;
        }

        // Handle columns with headings
        return `<div class="footer-column">
            <ul class="footer-nav text-sm font-medium flex flex-col gap-2.5">
                <li class="mb-1">
                    <h2 class="font-heading text-white text-lg font-medium"${column.heading.title ? ` title="${escapeHtml(column.heading.title)}"` : ''}>
                        ${escapeHtml(column.heading.text)}
                    </h2>
                </li>
                ${itemsHTML}
            </ul>
        </div>`;
    }).join('\n');

    return columnsHTML;
}

//Clean Title Attribute
function cleanTitleAttribute(title) {
    if (!title || typeof title !== 'string') {
        return '';
    }

    let cleanTitle = title.trim();

    // Remove [h] and [f] prefixes first
    cleanTitle = cleanTitle.replace(/^\[h\]/, '').replace(/^\[f\]/, '');

    // Remove + and - prefixes
    if (cleanTitle.startsWith('+') || cleanTitle.startsWith('-')) {
        cleanTitle = cleanTitle.substring(1);
    }

    return cleanTitle.trim();
}

//Sanitize Text
function sanitizeText(text) {
    return text ? text.trim().replace(/\s+/g, ' ') : '';
}

//Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

//Handle Footer Dropdown - Enhanced Version
function handleFooterDropdown() {
    const footerNavContainer = document.querySelector('.footer-nav');
    if (!footerNavContainer) return;

    // Use event delegation for better performance
    footerNavContainer.addEventListener('click', (event) => {
        try {
            const dropdown = event.target.closest('.footer-dropdown-container');
            if (!dropdown) {
                // Clicked somewhere in footer nav but not on a dropdown - close all dropdowns
                const allDropdowns = document.querySelectorAll('input[name="footer-dropdown"]');
                allDropdowns.forEach(dropdown => {
                    dropdown.checked = false;
                });
                return;
            }

            const checkbox = dropdown.querySelector('input[type="checkbox"]');
            const label = dropdown.querySelector('label');

            if (!checkbox || !label) return;

            // Toggle current dropdown if label or its children are clicked
            if (label.contains(event.target)) {
                event.preventDefault();
                checkbox.checked = !checkbox.checked;

                // Close other dropdowns
                const allDropdowns = document.querySelectorAll('input[name="footer-dropdown"]');
                allDropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== checkbox) {
                        otherDropdown.checked = false;
                    }
                });
            }
        } catch (error) {
            console.error('Error handling dropdown click:', error);
        }
    });

    // Close dropdowns when clicking outside the footer navigation area
    document.addEventListener('click', (event) => {
        try {
            if (!footerNavContainer.contains(event.target)) {
                const allDropdowns = document.querySelectorAll('input[name="footer-dropdown"]');
                allDropdowns.forEach(dropdown => {
                    dropdown.checked = false;
                });
            }
        } catch (error) {
            console.error('Error handling outside click:', error);
        }
    });

    // Handle escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const allDropdowns = document.querySelectorAll('input[name="footer-dropdown"]');
            allDropdowns.forEach(dropdown => {
                dropdown.checked = false;
            });
        }
    });
}

//Handle Language Switcher
function handleLanguageSwitcher() {
    const langSwitcher = document.getElementById("lang-switcher");
    const langSwitcherBtn = document.getElementById("lang-switcher-btn");
    const langSwitcherContent = document.getElementById("lang-switcher-content");
    var allLocales = [];

    if(langSwitcherBtn){
        const toggleDropdown = (dropdown) => {
            const isOpen = dropdown.dataset.open === "true";

            if (!isOpen) {
                // Close all other dropdowns first (including regular dropdowns)
                const allOtherDropdowns = document.querySelectorAll(".dropdown");
                allOtherDropdowns.forEach(otherDropdown => {
                    otherDropdown.setAttribute("data-open", "false");
                });
            }

            dropdown.setAttribute("data-open", isOpen ? "false" : "true");

            // Safari-specific focus management
            if (!isOpen) {
                dropdown.focus();
            }
        };

        // Add click event for the entire lang-switcher container
        langSwitcher.addEventListener("click", function(e) {
            e.stopPropagation();
            toggleDropdown(langSwitcher);
        });

        // Add keyboard support for Safari
        langSwitcher.addEventListener("keydown", function(e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleDropdown(langSwitcher);
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", function(e) {
            if (!langSwitcher.contains(e.target)) {
                langSwitcher.setAttribute("data-open", "false");
            }
        });

        // Add mouseleave event ONCE, outside of setSelectedLocale
        /*langSwitcher.addEventListener("mouseleave", function() {
            langSwitcher.setAttribute("data-open", "false");
        });*/

        //locale = ISO language code (e.g. 'en') - ISO Alpha 2 Country Code (e.g. 'GB')
        //E.g. for English in Britain will be en-GB
        //Get ISO-3166 Country codes from https://www.iban.com/country-codes
        //Get Language codes from https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes, https://www.andiamo.co.uk/resources/iso-language-codes/
        //Both language code and country code should be 2 characters only.
        //Some examples:
        //"en-GB","ar-SA","zh-CN","de-DE","es-ES","fr-FR","hi-IN","it-IT","id-ID","ja-JP","ko-KR","nl-NL","no-NO","pl-PL","pt-BR","sv-SE","fi-FI","th-TH","tr-TR","uk-UA","vi-VN","ru-RU","he-IL"
        const locales = GLOBAL.LOCALES.split(',');
        const getFlagSrc = (countryCode) => {
            return /^[A-Z]{2}$/.test(countryCode)
                ? `https://flagsapi.com/${countryCode.toUpperCase()}/flat/64.png`
                : "";
        };

        const setSelectedLocale = (locale) => {
            const intlLocale = new Intl.Locale(locale);
            const langName = new Intl.DisplayNames([locale], {
                type: "language",
            }).of(intlLocale.language);
            langSwitcherContent.innerHTML = "";
            const otherLocales = locales.filter((loc) => loc !== locale);


            otherLocales.forEach((otherLocale) => {
                const currLocale = new Intl.Locale(otherLocale).language;
                allLocales.push(currLocale);
            });

            otherLocales.forEach((otherLocale) => {
                const otherIntlLocale = new Intl.Locale(otherLocale);
                const otherLangName = new Intl.DisplayNames([otherLocale], {
                    type: "language",
                }).of(otherIntlLocale.language);
                const localeURL = getLocaleURL(otherIntlLocale.language);

                const listEl = document.createElement("li");
                listEl.tabIndex = "0";

                listEl.innerHTML = `<a id="localeURL${otherIntlLocale}" href="${localeURL}" style="margin-left: 0.5rem;height: 1.15rem;">
                                        <i class="fi fi-${otherIntlLocale.region.toLowerCase()}" data-locale="${otherIntlLocale}"></i>
                                    </a>
                                    <a href="${localeURL}" style="padding-top:5px;text-wrap: nowrap; flex-grow: 1;">${otherLangName}</a>`;
                listEl.value = otherLocale;
                listEl.addEventListener("click", function () {
                    setSelectedLocale(otherLocale);
                });
                listEl.addEventListener("keypress", function (e) {
                    if (e.key === "Enter") setSelectedLocale(otherLocale);
                });
                langSwitcherContent.appendChild(listEl);

            });
            /*langSwitcher.addEventListener("mouseleave", () => {
                document.activeElement.blur();
            });*/
            let flagIcon = `<img alt="flagdd" data-locale="${intlLocale}" src="${getFlagSrc(intlLocale.region)}" />`;
            flagIcon = `<i class="fi fi-${intlLocale.region.toLowerCase()}" data-locale="${intlLocale}"></i>`;
            langSwitcherBtn.innerHTML = flagIcon + `
                                         <span class="lang-name">${langName}</span>
                                         <img src="/assets/img/arrow.svg" alt="arrow" aria-hidden="true" class="arrow-icon hidden xs:block filter-theme h-3.5 transition-transform duration-300"/>`;
        };

        setSelectedLocale(locales[0]);
        const browserLang = new Intl.Locale(navigator.language).language;
        if(GLOBAL.REDIRECT_ON_LOCALE === "true"){
            console.warn("Redirecting to locale: " + browserLang);
            if(browserLang !== GLOBAL.ROOT_LOCALE){
                setSelectedLocale(locales[locales.findIndex(element => element.includes(browserLang+"-"))]);
                window.location = getLocaleURL(browserLang);
            }
        } else {
            setSelectedLocale(locales[locales.findIndex(element => element.includes(GLOBAL.ROOT_LOCALE+"-"))]);
        }
    }
}

//Handle Scroll To Top
function handleScrollToTop() {
    const scrollToTop = document.getElementById("scroll-to-top");
    const pageProgress = document.getElementById("page-progress");
    scrollToTop.addEventListener("click", () => {
        window.scrollTo(0, 0);
    });
    window.addEventListener("scroll", () => {
        const scrollPercentage =
            window.scrollY / (document.body.clientHeight - window.innerHeight);
        pageProgress.style.strokeDashoffset = `${(1 - scrollPercentage) * 305}`;
        if (window.scrollY >= window.innerHeight / 2) {
            scrollToTop.setAttribute("data-visible", "true");
        } else {
            scrollToTop.setAttribute("data-visible", "false");
        }
        //document.activeElement.blur();
    });
}

//Handle Ticker
function handleTickerWithAutoHide() {
    const ticker = document.getElementById("ticker");
    if (ticker) {
        const tickerVisibility = localStorage.getItem("ticker");
        if (tickerVisibility === "hidden" || tickerVisibility === "visible") {
            ticker.dataset.visible = tickerVisibility;
            localStorage.setItem("ticker", tickerVisibility);
        }

        const closeTicker = document.getElementById("close-ticker");
        if (closeTicker) {
            closeTicker.addEventListener("click", () => {
            ticker.dataset.visible = "hidden";
            localStorage.setItem("ticker", "hidden");

            // Trigger header position recalculation
            // Small delay to allow ticker to hide first
            setTimeout(() => {
                if (window.updateHeaderPositions)
                    window.updateHeaderPositions();
                }, 10);
        });
        }
        
        const scrollers = document.querySelectorAll(".scroller");
        const infiniteScrollAnimation = () => {
            scrollers.forEach((scroller) => {
                const scrollerInner = scroller.querySelector(".scroller-inner");
                const scrollerContent = Array.from(scrollerInner.children);
                scrollerContent.forEach((el) => {
                    const duplicatedItem = el.cloneNode(true);
                    scrollerInner.appendChild(duplicatedItem);
                });
            });
        };
        infiniteScrollAnimation();
    }
}

//Handle Top Menu Categories
function handleMenuCategories() {
    const categoryContainer = document.getElementById("category-container");
    const header = document.querySelector("header");
    const navItems = document.getElementById("nav-items");
    const mobileNav = document.getElementById("mobile-nav");
    const dropdowns = document.querySelectorAll(".dropdown");
    const resizeObserver = new ResizeObserver((entries) => {
        if (window.innerWidth >= 991) {
            mobileNav.setAttribute("data-open", "false");
            dropdowns.forEach((dropdown) => {
                dropdown.addEventListener("click", () => {
                    dropdown.setAttribute("data-open", "true");
                });
                /*dropdown.addEventListener("mouseleave", () => {
                    dropdown.setAttribute("data-open", "false");
                });*/
            });
        } else {
            document.addEventListener("click", (e) => {
                if (!header.contains(e.target)) {
                    mobileNav.setAttribute("data-open", "false");
                }
                if (navItems.contains(e.target)) {
                    mobileNav.setAttribute("data-open", "false");
                }
            });
        }

        if (categoryContainer.scrollWidth > categoryContainer.offsetWidth) {
            categoryContainer.style.justifyContent = "start";
        } else {
            categoryContainer.style.justifyContent = "center";
        }
    });

    resizeObserver.observe(document.body);
}

//Handle Membership FAQs
function moveFAQsToDestination() {
    // Get the source and destination containers
    const sourceContainer = document.getElementById('membership-source-faqs');
    const destinationContainer = document.querySelector('.membership-destination-faqs');
    const destinationSection = document.querySelector('#membership-destination-faqs-section');

    if (!sourceContainer || !destinationContainer) {
        return;
    }

    // Get all FAQ cards from the source
    const sourceFAQs = sourceContainer.querySelectorAll('.kg-toggle-card');

    if (sourceFAQs.length === 0) {
        destinationSection.hidden = true;
        return;
    }

    // Get the plus icon src from an existing accordion (if any) or use a fallback
    let plusIconSrc = '';
    const existingIcon = document.querySelector('img[alt="expand"]');
    if (existingIcon) {
        plusIconSrc = existingIcon.src;
    } else {
        // Fallback - update this path as needed
        plusIconSrc = '/assets/img/plus.svg';
    }

    // Clear the destination container (remove any existing content)
    destinationContainer.innerHTML = '';

    // Process each FAQ
    sourceFAQs.forEach((faq, index) => {
        // Extract the question and answer
        const questionElement = faq.querySelector('.kg-toggle-heading-text span');
        const answerElement = faq.querySelector('.kg-toggle-content p');

        if (!questionElement || !answerElement) {
            console.warn(`FAQ ${index + 1}: Missing question or answer element`);
            return;
        }

        const question = questionElement.textContent.trim();
        const answer = answerElement.innerHTML.trim(); // Use innerHTML to preserve any inner HTML formatting
        const faqNumber = String(index + 1).padStart(2, '0'); // Format as 01, 02, 03, etc.

        // Create the new FAQ accordion element
        const faqDiv = document.createElement('div');
        faqDiv.setAttribute('data-open', 'false');
        faqDiv.className = 'accordian border-b border-[--gray] group';

        faqDiv.innerHTML = `
            <div class="accordian-header flex gap-4 xs:gap-5 cursor-pointer text-sm xs:text-lg font-medium py-4 xs:py-5">
                <span class="text-[--text-primary] faq-number">${faqNumber}</span>
                <span class="text-[--text-primary] faq-title">${question}</span>
                <img src="${plusIconSrc}" alt="expand" class="ml-auto h-5 xs:h-6 filter-theme group-data-[open='true']:rotate-45 transition-all" aria-hidden="true"/>
            </div>
            <div class="grid group-data-[open='true']:grid-rows-[1fr] grid-rows-[0fr] [transition:grid-template-rows_ease-in-out_300ms]">
                <div class="overflow-hidden">
                    <p class="text-[--text-secondary] pb-4 xs:pb-5 text-sm xs:text-base font-medium faq-paragraph">
                        ${answer}
                    </p>
                </div>
            </div>
        `;

        // Add the FAQ to the destination container
        destinationContainer.appendChild(faqDiv);
    });
}

//Handle Accordians
function handleAccordians() {
    // Use event delegation - attach listener to document or a parent container
    document.addEventListener("click", (event) => {
        // Check if the clicked element is an accordion header or inside one
        const accordianHeader = event.target.closest('.accordian-header');

        if (!accordianHeader) return; // Not an accordion header click

        // Prevent any default behavior
        event.preventDefault();
        event.stopPropagation();

        const accordianElement = accordianHeader.parentElement;

        if (!accordianElement || !accordianElement.classList.contains('accordian')) {
            return;
        }

        // Close all sibling accordions (previous siblings)
        const prevSiblings = [];
        let prevSibling = accordianElement.previousElementSibling;
        while (prevSibling) {
            if (prevSibling.classList && prevSibling.classList.contains('accordian')) {
                prevSiblings.push(prevSibling);
            }
            prevSibling = prevSibling.previousElementSibling;
        }

        if (prevSiblings.length > 0) {
            prevSiblings.forEach((el) => {
                el.setAttribute("data-open", "false");
            });
        }

        // Close all sibling accordions (next siblings)
        const nextSiblings = [];
        let nextSibling = accordianElement.nextElementSibling;
        while (nextSibling) {
            if (nextSibling.classList && nextSibling.classList.contains('accordian')) {
                nextSiblings.push(nextSibling);
            }
            nextSibling = nextSibling.nextElementSibling;
        }

        if (nextSiblings.length > 0) {
            nextSiblings.forEach((el) => {
                el.setAttribute("data-open", "false");
            });
        }

        // Toggle the current accordion
        const isOpen = accordianElement.dataset.open === "true";
        accordianElement.setAttribute("data-open", isOpen ? "false" : "true");
    });
}

// Function to calculate percentage discount
function calculateDiscount(monthlyPrice, yearlyPrice) {
    // Calculate what the yearly cost would be if paying monthly
    const monthlyYearlyCost = monthlyPrice * 12;

    // Calculate the discount amount
    const discountAmount = monthlyYearlyCost - yearlyPrice;

    // Calculate percentage discount
    const discountPercentage = (discountAmount / monthlyYearlyCost) * 100;

    // Round to nearest whole number
    return Math.round(discountPercentage);
}

// Function to extract numeric value from price string
function extractPrice(priceString) {
    if (!priceString) return null;

    // Remove currency symbols, commas, and other non-numeric characters except decimal points
    const numericString = priceString.replace(/[^0-9.]/g, '');
    const price = parseFloat(numericString);

    return isNaN(price) ? null : price;
}

// Function to update discount displays
function updateDiscountDisplays() {
    const discountElements = document.querySelectorAll('.js-discount-number');

    discountElements.forEach(element => {
        const monthlyPriceAttr = element.getAttribute('data-monthly-price');
        const yearlyPriceAttr = element.getAttribute('data-yearly-price');

        // Skip if monthly price is missing
        if (!monthlyPriceAttr) {
            const wrapper = element.closest('.js-discount-wrapper');
            if (wrapper) {
                wrapper.style.display = 'none';
            }
            return;
        }

        const monthlyPrice = extractPrice(monthlyPriceAttr);
        const yearlyPrice = extractPrice(yearlyPriceAttr);

        // Skip if we can't extract valid prices
        if (!monthlyPrice || !yearlyPrice) {
            const wrapper = element.closest('.js-discount-wrapper');
            if (wrapper) {
                wrapper.style.display = 'none';
            }
            return;
        }

        // Calculate discount
        const discount = calculateDiscount(monthlyPrice, yearlyPrice);

        // Only show discount if it's greater than 0
        if (discount > 0) {
            element.innerHTML = `${discount}% `;
            const wrapper = element.closest('.js-discount-wrapper');
            if (wrapper) {
                wrapper.style.display = '';
            }
        } else {
            // Hide the wrapper if no discount
            const wrapper = element.closest('.js-discount-wrapper');
            if (wrapper) {
                wrapper.style.display = 'none';
            }
        }
    });
}

//Handle Load More
const handleLoadMore = () => {
    // init
    const loadMoreBtn = document.querySelector(".js-load-posts");
    // show articles number in pagination
    var currPage = GLOBAL.CURRENT_PAGE + 1;
    var postsPerPage = GLOBAL.POSTS_PER_PAGE;
    var totalPages = GLOBAL.MAX_PAGES;
    var totalPosts = GLOBAL.TOTAL_POSTS;
    var showingArticles = currPage * postsPerPage;

    if (loadMoreBtn && GLOBAL.LAST_PAGE) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.classList.add("btn-disabled");
        const noPostsText = loadMoreBtn.getAttribute('data-no-posts-text');
        loadMoreBtn.innerHTML = `<span class="h-[26px] flex items-center justify-center">${noPostsText}</span>`;
        showingArticles = totalPosts;
        let currArticles = document.getElementById("currArticles");
        currArticles.innerHTML = showingArticles;
    }

    // event
    if (loadMoreBtn) {
        loadMoreBtn.onclick = (event) => {
            loadMorePosts(event.target);
            currPage = GLOBAL.CURRENT_PAGE + 1;
        };
    }
};
//Load more posts
const loadMorePosts = (button) => {
    // next link
    const nextPage = document.querySelector("link[rel=next]");
    const loadMoreBtn = document.querySelector(".js-load-posts");
    const noPostsText = loadMoreBtn.getAttribute('data-no-posts-text');
    GLOBAL.NEXT_PAGE_LINK =
        nextPage && !GLOBAL.NEXT_PAGE_LINK
            ? nextPage.getAttribute("href")
            : GLOBAL.NEXT_PAGE_LINK;

    // Update current page value
    if (GLOBAL.NEXT_PAGE_LINK && !GLOBAL.LAST_PAGE) {
        button ? button.classList.add("is-loading") : "";

        // Fetch next page content
        fetch(GLOBAL.NEXT_PAGE_LINK)
            .then((res) => res.text())
            .then((text) => new DOMParser().parseFromString(text, "text/html"))
            .then((doc) => {
                // Get posts
                const posts = doc.querySelectorAll(".js-post-card");
                const postContainer = document.querySelector(".js-post-list");
                const nextPage = doc.querySelector("link[rel=next]");

                // Add each post to the page
                posts.forEach((post) => {
                    postContainer.appendChild(post);
                });

                // Update GLOBALS
                GLOBAL.CURRENT_PAGE = GLOBAL.CURRENT_PAGE + 1;
                GLOBAL.NEXT_PAGE_LINK = nextPage
                    ? nextPage.getAttribute("href")
                    : "";
                GLOBAL.NEXT_PAGE = GLOBAL.NEXT_PAGE_LINK
                    ? GLOBAL.NEXT_PAGE + 1
                    : NaN;
                GLOBAL.LAST_PAGE =
                    GLOBAL.CURRENT_PAGE === GLOBAL.MAX_PAGES ? true : false;

                // Update the article count immediately after posts are appended
                const currArticles = document.getElementById("currArticles");
                if (currArticles) {
                    currArticles.innerHTML = GLOBAL.LAST_PAGE
                        ? GLOBAL.TOTAL_POSTS
                        : (GLOBAL.CURRENT_PAGE) * GLOBAL.POSTS_PER_PAGE;
                }

                // Disable button on last page
                if (button && GLOBAL.LAST_PAGE) {
                    button.disabled = true;
                    button.classList.add("btn-disabled");
                    button.innerHTML = noPostsText;
                }

                button ? button.classList.remove("is-loading") : "";
            })
            .catch(function (err) {
                // There was an error
                console.warn("Something went wrong.", err);
            });
    }
};

//Handle External links
const handleExternalLinks = () => {
    if (GLOBAL.OPEN_LINKS_IN_NEW_TAB) {
        const normalizeDomain = (value) => {
            return String(value || "")
                .trim()
                .replace(/^https?:\/\//, "")
                .replace(/\/.*$/, "")
                .replace(/^www\./, "");
        };
        const domain = normalizeDomain(location.host);
        const localeDomains =
            GLOBAL.LOCALE_DOMAINS && typeof GLOBAL.LOCALE_DOMAINS === "object"
                ? Object.values(GLOBAL.LOCALE_DOMAINS)
                : [];
        const allowedDomains = [domain]
            .concat(localeDomains.map(normalizeDomain))
            .filter(Boolean);
        const postLinks = document.querySelectorAll("body a");
        postLinks.forEach((link) => {
            const linkURL = link.href.includes("?ref=")
                ? link.href.split("?ref=")[0]
                : link.href;
            const linkDomain = normalizeDomain(linkURL);
            const isAllowedDomain = allowedDomains.some((allowed) => {
                return linkDomain === allowed || linkDomain.endsWith("." + allowed);
            });
            if (!isAllowedDomain) {
                link.setAttribute("target", "_blank");
                link.setAttribute("rel", "noreferrer noopener");
            }
        });
    }
};

//Handle Gallery
const handleGallery = () => {
    //const images = document.querySelectorAll('.kg-gallery-image img');
    const images = document.querySelectorAll(".kg-image-card img, .kg-gallery-card img");
    const galleryImages = document.querySelectorAll(".kg-gallery-image img");

    // Gallery style
    galleryImages.forEach((image) => {
        image.setAttribute("alt", "Gallery Image");
        var container = image.closest(".kg-gallery-image");
        var width = image.attributes.width.value;
        var height = image.attributes.height.value;
        var ratio = width / height;
        container.style.flex = `${ratio} 1 0%`;
    });

    // Lighbox function
    if (GLOBAL.ENABLE_IMAGE_LIGHTBOX) {
        images.forEach((image) => {
            const link =
                image.parentNode.nodeName === "A"
                    ? image.parentNode.getAttribute("href")
                    : "";
            var lightboxWrapper = link
                ? image.parentNode
                : document.createElement("a");

            lightboxWrapper.setAttribute("data-no-swup", "");
            lightboxWrapper.setAttribute("data-fslightbox", "");
            lightboxWrapper.setAttribute("href", image.src);
            lightboxWrapper.setAttribute("aria-label", "Click for Lightbox");

            if (link) {
                var linkButton = document.createElement("a");
                linkButton.innerHTML =
                    '<i class="icon icon-link icon--xs"><svg class="icon__svg"><use xlink:href="/assets/icons/feather-sprite.svg#link"></use></svg></i>';
                linkButton.setAttribute("class", "image-link");
                linkButton.setAttribute("href", link);
                if (GLOBAL.OPEN_LINKS_IN_NEW_TAB) {
                    linkButton.setAttribute("target", "_blank");
                    linkButton.setAttribute("rel", "noreferrer noopener");
                }
                lightboxWrapper.parentNode.insertBefore(
                    linkButton,
                    lightboxWrapper.parentNode.firstChild
                );
            } else {
                image.parentNode.insertBefore(
                    lightboxWrapper,
                    image.parentNode.firstChild
                );
                lightboxWrapper.appendChild(image);
            }
        });
        refreshFsLightbox();
    }
    GLOBAL.ENABLE_IMAGE_LIGHTBOX ? refreshFsLightbox() : "";
};

//Responsive Embeds
(function (global, factory) {
    typeof exports === "object" && typeof module !== "undefined"
        ? (module.exports = factory())
        : typeof define === "function" && define.amd
            ? define(factory)
            : ((global = global || self), (global.reframe = factory()));
})(this, function () {
    "use strict";

    function reframe(target, cName) {
        var frames =
            typeof target === "string"
                ? document.querySelectorAll(target)
                : target;
        var c = cName || "js-reframe";
        if (!("length" in frames)) frames = [frames];
        for (var i = 0; i < frames.length; i += 1) {
            var frame = frames[i];
            var hasClass = frame.className.split(" ").indexOf(c) !== -1;
            if (hasClass || frame.style.width.indexOf("%") > -1) continue;
            var h = frame.getAttribute("height") || frame.offsetHeight;
            var w = frame.getAttribute("width") || frame.offsetWidth;
            var padding = (h / w) * 100;
            var div = document.createElement("div");
            div.className = c;
            var divStyles = div.style;
            divStyles.position = "relative";
            divStyles.width = "100%";
            divStyles.paddingTop = padding + "%";
            var frameStyle = frame.style;
            frameStyle.position = "absolute";
            frameStyle.width = "100%";
            frameStyle.height = "100%";
            frameStyle.left = "0";
            frameStyle.top = "0";
            frame.parentNode.insertBefore(div, frame);
            frame.parentNode.removeChild(frame);
            div.appendChild(frame);
        }
    }

    return reframe;
});

function handleTheme() {
    //Handling theme
    const themeToggle = document.getElementById("theme-toggle");

    const currentTheme = localStorage.getItem("theme")
        ? localStorage.getItem("theme")
        : document.documentElement.dataset.theme;

    if (currentTheme) {
        localStorage.setItem("theme", currentTheme);
        document.documentElement.setAttribute("data-theme", currentTheme);
    }

    const switchTheme = () => {
        const theme = localStorage.getItem("theme");
        if (theme) {
            if (theme === "light") {
                document.documentElement.setAttribute("data-theme", "dark");
                localStorage.setItem("theme", "dark");
            } else if (theme === "dark") {
                document.documentElement.setAttribute("data-theme", "light");
                localStorage.setItem("theme", "light");
            }
        }
    };

    themeToggle.addEventListener("click", switchTheme);
}

/**
 * DOM Loaded event
 */
export default function handler() {
    // Bind critical UI first so a later failure can never disable it
    handleMobileNavigation();
    handleDropdown();
    handleSecondaryDropdown();
    handleScrollToTop();
    handleLanguageSwitcher();

    const safe = (fn, label) => {
        try { fn(); } catch (err) { console.warn(`[theme] ${label} failed:`, err); }
    };

    if (GLOBAL.AUTO_HIDE_HEADER) {
        safe(() => { window.updateHeaderPositions = handleHeaderWithAutoHide(); }, 'handleHeaderWithAutoHide');
        safe(handleTickerWithAutoHide, 'handleTickerWithAutoHide');
    } else {
        safe(() => { window.updateHeaderPositions = handleHeader(); }, 'handleHeader');
        safe(handleTicker, 'handleTicker');
    }

    safe(transformSecondaryNavigation, 'transformSecondaryNavigation');
    safe(transformFooterNavigation, 'transformFooterNavigation');
    safe(handleFooterDropdown, 'handleFooterDropdown');
    safe(handleMenuCategories, 'handleMenuCategories');
    safe(moveFAQsToDestination, 'moveFAQsToDestination');
    safe(handleAccordians, 'handleAccordians');
    safe(handleGallery, 'handleGallery');
    safe(handleLoadMore, 'handleLoadMore');
    safe(handleExternalLinks, 'handleExternalLinks');
    safe(updateDiscountDisplays, 'updateDiscountDisplays');

    const sources = [
        '.post-page-content iframe[src*="youtube.com"]',
        '.post-page-content iframe[src*="youtube-nocookie.com"]',
        '.post-page-content iframe[src*="player.vimeo.com"]',
        '.post-page-content iframe[src*="kickstarter.com"][src*="video.html"]',
        '.post-page-content object',
        '.post-page-content embed',
    ];
    safe(() => reframe(document.querySelectorAll(sources.join(','))), 'reframe');
}