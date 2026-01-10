import FileService from "@/services/apiservices/file-service";

export function lookupImageUrlFileOri(item) {
    if (!item)  return require("@/assets/images/no_image_available.jpeg");
    if (!item.fileName) return require("@/assets/images/no_image_available.jpeg");
    return FileService.image_url_ori(item.fileName);
}

export function lookupFileSignatureUrl(item) {
    if (!item)  return require("@/assets/images/no_image_available.jpeg");
    if (!item.fileName) return require("@/assets/images/no_image_available.jpeg");
    return FileService.signature_url(item.fileName);
}
export function lookupImageUrl(item) {
    if (item.avatarImage === undefined || item.avatarImage === "") {
        return require("@/assets/images/no_image_available.jpeg");
    } else {
        return FileService.image_url_high(item.avatarImage);
    }
}
export function lookupImageUrlLazy(item) {
    if (item.avatarImage === undefined || item.avatarImage === "") {
        return require("@/assets/images/no_image_available.jpeg");
    } else {
        return FileService.image_url_verylow(item.avatarImage);
    }
}
