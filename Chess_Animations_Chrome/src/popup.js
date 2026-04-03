document.addEventListener('DOMContentLoaded', () => {
    const options = document.querySelectorAll('.theme-option');
    
    // Load current theme
    chrome.storage.local.get(['selectedTheme'], (result) => {
        const theme = result.selectedTheme || 'origin';
        document.getElementById(theme).classList.add('selected');
    });

    options.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.getAttribute('data-theme');
            
            // UI Update
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');

            // Save
            chrome.storage.local.set({ selectedTheme: theme });
        });
    });
});
