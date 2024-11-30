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
		const target = 100000;
		return (price / target) * 100;
	}, [price]);

	return (
		<div className="min-h-screen bg-[#1a1b26] flex items-center justify-center p-4">
			<Card className="w-full max-w-2xl bg-transparent border-none text-white shadow-none">
				<div className="space-y-8">
					<div className="flex items-center flex-col justify-center gap-2 text-[#f7931a]">
						<Bitcoin className="w-20 h-20" />
						<h1 className="text-2xl md:text-3xl font-bold">
							Bitcoin Countdown to $100k
						</h1>
					</div>

					{status === "live" ? (
						<>
							<div className="text-center">
								<div className="text-5xl md:text-7xl font-bold tracking-tighter flex items-center justify-center">
									${formattedPrice}
									{trend === "up" && (
										<ArrowUp className="w-8 h-8 text-green-500 ml-2" />
									)}
									{trend === "down" && (
										<ArrowDown className="w-8 h-8 text-red-500 ml-2" />
									)}
								</div>
							</div>

							<div className="space-y-2">
								<div className="flex justify-between text-sm text-gray-400">
									<span>$0</span>
									<span>Progress to $100k</span>
									<span>🚀</span>
								</div>
								<Progress
									value={progressPercentage}
									max={100}
									className="w-full"
								/>
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
					<Separator className="mb-8 opacity-50" />
					<footer className="text-center text-xs text-gray-600 space-y-2 w-full">
						<p>
							built with{" "}
							<a
								href="https://nextjs.org"
								target="_blank"
								rel="noreferrer noopener"
								className="underline hover:text-gray-200"
							>
								Next.js
							</a>{" "}
							and{" "}
							<a
								href="https://v0.dev"
								target="_blank"
								rel="noreferrer noopener"
								className="underline hover:text-gray-200"
							>
								v0
							</a>
							, deployed on{" "}
							<a
								href="https://vercel.com"
								target="_blank"
								rel="noreferrer noopener"
								className="underline hover:text-gray-200"
							>
								Vercel
							</a>
						</p>
						<p>
							code open source{" "}
							<a
								href="https://github.com/jose-donato/btc-100k"
								target="_blank"
								rel="noreferrer noopener"
								className="underline hover:text-gray-200"
							>
								here
							</a>
							. any question dm{" "}
							<a
								href="https://twitter.com/josedonato__"
								target="_blank"
								rel="noreferrer noopener"
								className="underline hover:text-gray-200"
							>
								@josedonato__
							</a>
						</p>
					</footer>
				</div>
			</Card>
		</div>
	);
}
