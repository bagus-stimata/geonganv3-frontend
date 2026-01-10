import EViewType from "@/models/e-view-type";

/**
 * Bikin link whatsapp langsung ke nomor dengan text optional
 */
export  function isDataBenerBenerKosong(itemFtMonev){
    return itemFtMonev.kode1 === '' && itemFtMonev.description === '' && itemFtMonev.objName === '' && itemFtMonev.nib === ''
        && itemFtMonev.listFtMonevFile.length===0 && itemFtMonev.listFtKlarifikasiRes.length===0 && itemFtMonev.listFtWasdalRes.length===0;
}

export  function isBisaHapus(itemFtMonev) {
    return itemFtMonev.listFtMonevFile.length===0 && itemFtMonev.listFtKlarifikasiRes.length===0 && itemFtMonev.listFtWasdalRes.length===0;
}

export  function isBisaHapusKlarifikasi(itemFtKlarifikasi) {
    return itemFtKlarifikasi.listFtKlarifikasiFile.length===0 && itemFtKlarifikasi.listFtKlarifikasiFile.length===0;
}
export  function isBisaHapusWasdal(itemFtWasdal) {
    return itemFtWasdal.listFtWasdalFile.length===0 && itemFtWasdal.listFtWasdalFile.length===0;
}

export  function isViewerAndTl(fromView) {
    return fromView === EViewType.MONITORING || fromView === EViewType.REKOMTL;
}
