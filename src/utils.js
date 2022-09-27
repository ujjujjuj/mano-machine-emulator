export const downloadArrayBuffer = (buf) => {
    const blob = new Blob([buf], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.style = "display:none;";
    a.href = url;
    a.download = `mano-rom-${Date.now()}.bin`;
    a.click();
    setTimeout(() => {
        a.remove();
        window.URL.revokeObjectURL(url);
    }, 100);
};
