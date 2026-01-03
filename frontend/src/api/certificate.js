import axios from "axios";

export const createCertficate = async (metadata) => {
    const response = await axios.post('/certificate/generate', metadata, { responseType: 'blob' }) //imp for pdf download
    return response
}

export const createDownloadLink = (metadata, response) => {
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${metadata.playerName.replace(/\s+/g, '-')}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}