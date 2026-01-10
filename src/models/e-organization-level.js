const EOrganizationLevel = Object.freeze({
    SYS : "SYS",
    CORP: "CORP",
    DIV: "DIV",
})
const EOrganizationLevels = Object.freeze([
    {
        id: EOrganizationLevel.SYS,
        description: 'SYS (Holding)'
    },
    {
        id: EOrganizationLevel.CORP,
        description: 'CORP (DINAS/PROVINSI)'
    },
    {
        id: EOrganizationLevel.DIV,
        description: 'DIV (Bidang)'
    },

])
export  {EOrganizationLevel as default, EOrganizationLevels}