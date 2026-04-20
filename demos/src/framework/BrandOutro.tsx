import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';

interface Props {
	at: number;
	slideFrames: number;
	holdFrames: number;
	brand: string;
	url: string;
	sceneFrom: number;
	siteLayer: React.ReactNode;
}

const EASE = Easing.bezier(0.7, 0, 0.3, 1);

export const BrandOutro: React.FC<Props> = ({
	at,
	slideFrames,
	holdFrames,
	brand,
	url,
	sceneFrom,
	siteLayer,
}) => {
	const frame = useCurrentFrame() - sceneFrom - at;
	const total = slideFrames + holdFrames;
	if (frame < 0) {
		return <>{siteLayer}</>;
	}
	if (frame > total + 60) return null;

	const sitePercent = interpolate(frame, [0, slideFrames], [0, -100], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: EASE,
	});
	const taglinePercent = interpolate(frame, [0, slideFrames], [100, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: EASE,
	});

	return (
		<AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					transform: `translateX(${sitePercent}%)`,
					willChange: 'transform',
				}}
			>
				{siteLayer}
			</div>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					transform: `translateX(${taglinePercent}%)`,
					background: '#000',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					color: '#fff',
					fontFamily:
						'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
					willChange: 'transform',
				}}
			>
				<div
					style={{
						fontSize: 92,
						fontWeight: 700,
						letterSpacing: -2,
						lineHeight: 1,
					}}
				>
					{brand}
				</div>
				<div
					style={{
						fontSize: 18,
						fontWeight: 400,
						letterSpacing: '0.4em',
						textTransform: 'uppercase',
						color: '#9a9aa8',
						marginTop: 28,
					}}
				>
					{url}
				</div>
			</div>
		</AbsoluteFill>
	);
};
