import EStatusMonev, {EStatusMonevs} from "@/models/e-status-monev";
import EStatusTl, {EStatusTls} from "@/models/e-status-tindak-lanjut";

export function lookupTextColorByMonevStatus(monevStatus) {
    if (monevStatus === EStatusMonev.AVAILABLE) return "text-grey";
    else if (monevStatus === EStatusMonev.READ) return "text-blue";
    else if (monevStatus === EStatusMonev.ON_SURVEY) return "text-deep-orange";
    else if (monevStatus === EStatusMonev.SUBMITTED) return "text-green";
}
export function lookupStatusMonev(id) {
    const str = EStatusMonevs.filter((x) => x.id === id);
    if (str.length > 0) {
        return str[0];
    } else {
        return "-";
    }
}
export function lookupTextColorByTlStatus(tlStatus) {
    if (tlStatus === EStatusTl.MENUNGGU_TL) return "text-blue-grey";
    else if (tlStatus === EStatusTl.REKOM_TL) return "text-blue";
    else if (tlStatus === EStatusTl.ON_PROCESS) return "text-deep-orange";
    else if (tlStatus === EStatusTl.SUDAH_TL) return "text-indigo";
    else if (tlStatus === EStatusTl.VALIDATED) return "text-green";
}
export function lookupStatusTl(id) {
    const str = EStatusTls.filter((x) => x.id === id);
    if (str.length > 0) {
        return str[0];
    } else {
        return "-";
    }
}
