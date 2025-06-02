"use client";

import PoweredByPyth from "@/components/icons/PoweredByPyth";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
	PriceStatus,
	type PythCluster,
	PythConnection,
	getPythClusterApiUrl,
	getPythProgramKeyForCluster,
} from "@pythnetwork/client";
import { Connection, PublicKey } from "@solana/web3.js";
import { ArrowDown, ArrowUp, Bitcoin, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export default function BitcoinPriceTracker() {
	const [price, setPrice] = useState<number>(0);
	const [status, setStatus] = useState<string>("connecting");
	const prevPriceRef = useRef<number>(0);
	const [trend, setTrend] = useState<"up" | "down" | null>(null);

	useEffect(() => {
		const PYTHNET_CLUSTER_NAME: PythCluster = "pythnet";
		const connection = new Connection(
			getPythClusterApiUrl(PYTHNET_CLUSTER_NAME),
		);
		const pythPublicKey = getPythProgramKeyForCluster(PYTHNET_CLUSTER_NAME);
		const btcFeed = new PublicKey(
			"GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU",
		);

		const pythConnection = new PythConnection(
			connection,
			pythPublicKey,
			"confirmed",
			[btcFeed],
		);

		pythConnection.onPriceChangeVerbose((productAccount, priceAccount) => {
			const price = priceAccount.accountInfo.data;
			if (price.price && price.confidence) {
				const newPrice = price.price;
				setTrend(newPrice > prevPriceRef.current ? "up" : "down");
				prevPriceRef.current = newPrice;
				setPrice(newPrice);
				setStatus("live");
			} else {
				setStatus(PriceStatus[price.status]);
			}
		});

		pythConnection.start();

		return () => {
			pythConnection.stop();
		};
	}, []);

	const formattedPrice = useMemo(() => {
		return price.toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	}, [price]);

	const progressPercentage = useMemo(() => {
		const target = 103613; // James Wynn's liquidation price
		return (price / target) * 100;
	}, [price]);

	const priceDifference = useMemo(() => {
		const target = 103613;
		const difference = Math.abs(target - price);
		return difference.toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	}, [price]);

	return (
		<div 
			className="min-h-screen bg-[#1a1b26] flex items-center justify-center p-4 relative"
			style={{
				backgroundImage: 'url("https://pbs.twimg.com/profile_images/1929471787030683648/SBbLOZkA_400x400.jpg")',
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
			}}
		>
			<div className="absolute inset-0 bg-black/80" />
			<Card className="w-full max-w-2xl bg-transparent border-none text-white shadow-none relative z-10">
				<div className="space-y-8">
					<div className="flex items-center flex-col justify-center gap-2 text-[#f7931a]">
						<h1 className="text-2xl md:text-3xl font-bold">
							@JamesWynnReal Liquidation
						</h1>
					</div>

					{status === "live" ? (
						<>
							<div className="text-center space-y-4">
								<div className="text-5xl md:text-7xl font-bold tracking-tighter flex items-center justify-center">
									${priceDifference}
									{trend === "up" && (
										<ArrowUp className="w-8 h-8 text-green-500 ml-2" />
									)}
									{trend === "down" && (
										<ArrowDown className="w-8 h-8 text-red-500 ml-2" />
									)}
								</div>
								<div className="space-y-2 text-xl md:text-2xl text-gray-400">
									<div>Current Price: ${formattedPrice}</div>
									<div>Liquidation Price: $103,613</div>
								</div>
							</div>
						</>
					) : (
						<div className="flex items-center justify-center">
							<Loader2 className="w-8 h-8 animate-spin" />
						</div>
					)}

					<div className="flex items-center justify-center gap-4">
						<a
							href="https://pyth.network"
							target="_blank"
							rel="noreferrer noopener"
						>
							<PoweredByPyth className="w-24 h-24" />
						</a>
					</div>
				</div>
				<div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%]">
				</div>
			</Card>
		</div>
	);
}
