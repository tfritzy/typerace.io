import Avatar from "boring-avatars";
import { 
    BronzeBorder, 
    SilverBorder, 
    GoldBorder, 
    PlatinumBorder, 
    DiamondBorder, 
    MasterBorder,
    LeagueBorder,
    League
} from './index';

export const LeagueBorderExample = () => {
    const identityHash = "example-hash";
    const avatarColors = ["#fbbf24", "#f59e0b", "#d97706", "#b45309", "#92400e"];

    return (
        <div className="flex flex-col gap-8 p-8">
            <h2 className="text-2xl font-bold text-white">League Borders Example</h2>
            
            <div className="flex flex-wrap gap-6">
                <div className="flex flex-col items-center gap-2">
                    <BronzeBorder>
                        <Avatar
                            size={40}
                            name={identityHash}
                            variant="pixel"
                            colors={avatarColors}
                        />
                    </BronzeBorder>
                    <span className="text-sm text-white">Bronze</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <SilverBorder>
                        <Avatar
                            size={40}
                            name={identityHash}
                            variant="pixel"
                            colors={avatarColors}
                        />
                    </SilverBorder>
                    <span className="text-sm text-white">Silver</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <GoldBorder>
                        <Avatar
                            size={40}
                            name={identityHash}
                            variant="pixel"
                            colors={avatarColors}
                        />
                    </GoldBorder>
                    <span className="text-sm text-white">Gold</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <PlatinumBorder>
                        <Avatar
                            size={40}
                            name={identityHash}
                            variant="pixel"
                            colors={avatarColors}
                        />
                    </PlatinumBorder>
                    <span className="text-sm text-white">Platinum</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <DiamondBorder>
                        <Avatar
                            size={40}
                            name={identityHash}
                            variant="pixel"
                            colors={avatarColors}
                        />
                    </DiamondBorder>
                    <span className="text-sm text-white">Diamond</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <MasterBorder>
                        <Avatar
                            size={40}
                            name={identityHash}
                            variant="pixel"
                            colors={avatarColors}
                        />
                    </MasterBorder>
                    <span className="text-sm text-white">Master</span>
                </div>
            </div>

            <h3 className="text-xl font-bold text-white mt-4">Using LeagueBorder Component</h3>
            <div className="flex flex-wrap gap-6">
                {Object.values(League).map((league) => (
                    <div key={league} className="flex flex-col items-center gap-2">
                        <LeagueBorder league={league}>
                            <Avatar
                                size={40}
                                name={identityHash}
                                variant="pixel"
                                colors={avatarColors}
                            />
                        </LeagueBorder>
                        <span className="text-sm text-white capitalize">{league}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
