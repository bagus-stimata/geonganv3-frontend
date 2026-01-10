const ERoleDesc = Object.freeze({
    ROLE_ADMIN: { id: "ROLE_ADMIN", description: "Administrator penuh akses" },
    ROLE_USER: { id: "ROLE_USER", description: "Admin Dinas" },
    ROLE_SURVEYOR: { id: "ROLE_SURVEYOR", description: "API Private User" },
    ROLE_MANAGER: { id: "ROLE_MANAGER", description: "Pejabat, Kepala Dinas" },
    ROLE_GUEST: { id: "ROLE_GUEST", description: "Guest Viewer" },
});

const ERole = Object.freeze({
    ROLE_ADMIN: ERoleDesc.ROLE_ADMIN.id,
    ROLE_USER: ERoleDesc.ROLE_USER.id,
    ROLE_SURVEYOR: ERoleDesc.ROLE_SURVEYOR.id,
    ROLE_MANAGER: ERoleDesc.ROLE_MANAGER.id,
    ROLE_GUEST: ERoleDesc.ROLE_GUEST.id,
});


const ERoles = Object.freeze(Object.values(ERoleDesc).map(r => r));

export { ERole as default, ERoles, ERoleDesc};