import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

type EditNameModalProps = {
    currentName: string;
    onSave: (name: string) => void;
    onClose: () => void;
};

export const EditNameModal = ({ currentName, onSave, onClose }: EditNameModalProps) => {
    const [name, setName] = useState(currentName);

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
            onClose();
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="min-w-[400px] max-w-[500px]">
                <DialogHeader className="mb-6">
                    <DialogTitle>Edit Name</DialogTitle>
                </DialogHeader>

                <div className="mb-8">
                    <Label className="mb-2 block">Name</Label>
                    <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={30}
                        autoFocus
                    />
                </div>

                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!name.trim()}>
                        Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
