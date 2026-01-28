export const exportToCSV = (data, headers, filename = 'export.csv') => {
    // Convert headers to CSV string
    const headerRow = headers.join(',');

    // Convert data rows to CSV strings
    const dataRows = data.map(row => {
        return row.map(field => {
            // Handle null or undefined
            if (field === null || field === undefined) {
                return '';
            }

            // Convert to string
            let stringField = String(field);

            // Escape quotes by doubling them
            stringField = stringField.replace(/"/g, '""');

            // If the field contains comma, newline, or quotes, wrap in quotes
            if (stringField.search(/("|,|\n)/g) >= 0) {
                stringField = `"${stringField}"`;
            }

            return stringField;
        }).join(',');
    });

    // Combine header and data
    const csvContent = [headerRow, ...dataRows].join('\n');

    // Create Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    // Create download URL
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
