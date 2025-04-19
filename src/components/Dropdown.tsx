import { ReactNode, useState, useRef, useEffect } from "react";

interface DropdownProps {
    trigger: ReactNode;
    children: ReactNode;
    align?: "left" | "right";
}

const Dropdown = ({ trigger, children, align = "right" }: DropdownProps) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <div onClick={() => setOpen(!open)} className="cursor-pointer">
                {trigger}
            </div>
            {open && (
                <div
                    className={`absolute mt-2 min-w-[160px] rounded-xl bg-white dark:bg-gray-800 shadow z-20 ${align === "right" ? "right-0" : "left-0"
                        }`}
                >
                    {children}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
