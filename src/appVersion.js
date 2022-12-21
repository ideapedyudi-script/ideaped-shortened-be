import numeral from 'numeral';

export const Version = 1;
export const MajorVersion = 1;
export const MinorVersion = 0;
export const buildNumber = 0;
export const AppVersion = `${Version}.${MajorVersion}.${MinorVersion}.${numeral(buildNumber).format('0000')}`;

export const UpdateHistory = [
    {
        version: "1.1.0.0",
        update: [
            "membuat api shortened di home page"
        ]
    }
]

export const getUpdateLogs = () => {
    if (UpdateHistory.length < 5) return UpdateHistory;
    const up = [];
    for (let uuu = 0; uuu < 5; uuu++) {
        const u = UpdateHistory[uuu];
        up.push(u);
    }
    return up;
}