import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type Testimonial = {
	/** The quote. Wrap the part to emphasise in `highlight` (it must appear in `quote`). */
	quote: string;
	highlight?: string;
	name: string;
	role: string;
	/** Optional photo; the initials show until it loads, or if there is none. */
	avatarSrc?: string;
	initials: string;
};

/**
 * A single testimonial: framed avatar with fading hairlines, then the quote and who said it.
 * Same layout as the original testimonials-2, with the content passed in as props.
 */
export function TestimonialsSection({ quote, highlight, name, role, avatarSrc, initials, className }: Testimonial & { className?: string }) {
	const parts = highlight && quote.includes(highlight) ? quote.split(highlight) : [quote];
	return (
		<figure className={cn("mx-auto flex w-full max-w-2xl flex-col items-center justify-center md:grid md:grid-cols-[auto_1fr]", className)}>
			<div className="relative">
				{/* Vertical lines */}
				<MaskLine className="left-0" orientation="vertical" />
				<MaskLine className="right-0" orientation="vertical" />
				{/*  Horizontal lines */}
				<MaskLine className="top-0 md:w-xl" orientation="horizontal" />
				<MaskLine className="bottom-0 md:w-xl" orientation="horizontal" />

				<Avatar className="mask-[radial-gradient(circle,black_60%,transparent)] size-24 rounded-none *:rounded-none md:size-32">
					{avatarSrc && <AvatarImage alt={`${name}'s profile picture`} src={avatarSrc} />}
					<AvatarFallback className="testi-initials">{initials}</AvatarFallback>
				</Avatar>
			</div>
			<figcaption className="space-y-4 p-8 text-center md:p-6 md:text-left">
				<blockquote className="text-lg text-muted-foreground leading-tight tracking-tight">
					&quot;{parts.length === 2 ? <>{parts[0]}<span className="font-medium text-foreground">{highlight}</span>{parts[1]}</> : quote}&quot;
				</blockquote>

				<div>
					<cite className="font-medium text-foreground text-xs not-italic">{name}</cite>
					<div className="text-[10px] text-muted-foreground">{role}</div>
				</div>
			</figcaption>
		</figure>
	);
}

export function MaskLine({
	className,
	orientation,
	...props
}: React.ComponentProps<"div"> & { orientation?: "horizontal" | "vertical" }) {
	return (
		<div
			aria-hidden="true"
			className={cn(
				"absolute bg-foreground/20",
				orientation === "vertical" &&
					"mask-t-from-80% mask-b-from-80% -inset-y-1/2 w-px",
				orientation === "horizontal" &&
					"mask-l-from-80% mask-r-from-80% -inset-x-1/2 h-px",
				className
			)}
			{...props}
		/>
	);
}

export default TestimonialsSection;
