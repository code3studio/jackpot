/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import React, { useState, useMemo } from "react";
import { useSolanaPrice } from "../utils/util";
import { useWallet } from "@solana/wallet-adapter-react";
import { enterGame, playGame } from "../context/solana/transaction";
import { useSocket } from "../context/SocketContext";
import { PublicKey } from "@solana/web3.js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Head from "next/head";

import Chat from "../components/Chat";
import MobileChat from "../components/Chat/MobileChat";
import { base58ToGradient } from "../utils/util";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

if (typeof Highcharts === "object") {
  require("highcharts/highcharts-more")(Highcharts);
  require("highcharts/modules/solid-gauge")(Highcharts);
}

export default function Waiting() {
  const wallet = useWallet();
  const { gameData, winner } = useSocket();
  const [betAmount, setBetAmount] = useState(0.1);
  const [isBetLoading, setIsBetLoading] = useState(false);
  const { isLoading, isError, data, error } = useSolanaPrice();
  const [isRolling, setIsRolling] = useState(false);
  const [isWonWindow, setIsWonWindow] = useState(false);
  const [wonValue, setWonValue] = useState(0);
  const [isMobileChat, setIsMobileChat] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);

  const sumPots = useMemo(() => {
    if (gameData && gameData && gameData.players) {
      const sumBets = gameData.players.reduce(
        (sum: number, item: any) => sum + item.amount,
        0
      );
      return sumBets / LAMPORTS_PER_SOL;
    } else {
      return 0;
    }
  }, [gameData]);

  const handleBet = async () => {
    try {
      if (gameData && gameData.players && gameData.players.length !== 0) {
        await enterGame(
          wallet,
          new PublicKey(gameData.pda),
          betAmount,
          setIsBetLoading,
          gameData.endTimestamp
        );
      } else {
        await playGame(wallet, betAmount, setIsBetLoading);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleBetAmount = (value: number) => {
    setBetAmount(value);
  };

  const handleEndGame = () => {
    setIsWonWindow(false);
  };

  const winPercent = useMemo(() => {
    if (
      gameData &&
      gameData &&
      gameData.players &&
      gameData.players.length === 0
    ) {
      return 0;
    } else if (gameData) {
      const sumBets = gameData.players?.reduce(
        (sum: number, item: any) => sum + item.amount,
        0
      );
      if (wallet.publicKey !== null) {
        const userBet = gameData.players?.find(
          (item: any) => item.player === wallet.publicKey?.toBase58()
        );
        if (userBet) {
          return userBet.amount / sumBets;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    }
  }, [gameData?.players, wallet.publicKey, wallet.connected]);
  // @ts-ignore
  const chartOptions = {
    chart: {
      type: "pie",
      backgroundColor: "#080808",
      events: {
        render: function () {
          const chart = this;
          const text = `${sumPots} SOL`;
          const countdownText = `Time left: --s`;
          const style = {
            color: "#FFFFFF",
            fontSize: "20px",
            textAlign: "center",
          };

          // @ts-ignore
          if (!chart.customText) {
            // @ts-ignore

            chart.customText = chart.renderer
              .text(
                text,
                // @ts-ignore

                chart.chartWidth / 2,
                // @ts-ignore

                chart.plotHeight / 2 + chart.plotTop
              )
              .css(style)
              .attr({
                align: "center",
                zIndex: 5,
              })
              .add();
          } else {
            // @ts-ignore

            chart.customText.attr({
              text: text,
              // @ts-ignore

              x: chart.chartWidth / 2,
              // @ts-ignore

              y: chart.plotHeight / 2 + chart.plotTop,
            });
          }
          //@ts-ignore
          if (!chart.countdownText) {
            //@ts-ignore

            chart.countdownText = chart.renderer
              //@ts-ignore

              .text(
                countdownText,
                //@ts-ignore

                chart.chartWidth / 2,
                //@ts-ignore

                chart.plotHeight / 2 + chart.plotTop + 30
              )
              .css(style)
              .attr({
                align: "center",
                zIndex: 5,
              })
              .add();
          } else {
            //@ts-ignore

            chart.countdownText.attr({
              text: countdownText,
              //@ts-ignore

              x: chart.chartWidth / 2,
              //@ts-ignore

              y: chart.plotHeight / 2 + chart.plotTop + 30,
            });
          }
        },
        redraw: function () {
          const chart = this;
          // @ts-ignore

          if (chart.customText) {
            // @ts-ignore

            chart.customText.attr({
              // @ts-ignore

              x: chart.chartWidth / 2,
              // @ts-ignore

              y: chart.plotHeight / 2 + chart.plotTop,
            });
          }
          // @ts-ignore

          if (chart.countdownText) {
            // @ts-ignore

            chart.countdownText.attr({
              // @ts-ignore

              x: chart.chartWidth / 2,
              // @ts-ignore

              y: chart.plotHeight / 2 + chart.plotTop + 30,
            });
          }
        },
      },
    },
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },
    pane: {
      center: ["50%", "50%"],
      size: "100%",
      startAngle: 0,
      endAngle: 360,
      background: {
        backgroundColor: "#080808",
        innerRadius: "90%",
        outerRadius: "100%",
        shape: "arc",
      },
    },
    tooltip: {
      enabled: true,
    },
    yAxis: {
      min: 0,
      max: 60, // Example total time
      stops: [[1.0, "#FAF9F6"]],
      lineWidth: 0,
      tickWidth: 0,
      minorTickInterval: null,
      tickAmount: 0,
      labels: {
        enabled: false,
      },
    },
    plotOptions: {
      pie: {
        dataLabels: {
          enabled: false,
        },
        center: ["50%", "50%"],
        size: "100%",
      },
      solidgauge: {
        dataLabels: {
          enabled: false,
        },
        linecap: "round",
        rounded: true,
      },
    },
    colors: ["#FF204E", "#F72798", "#F57D1F", "#EBF400"],
    series: [
      {
        type: "pie",
        name: "Amount",
        data: [
          { name: "Player 1", y: 0.5 },
          { name: "Player 2", y: 1 },
          { name: "Player 3", y: 0.75 },
          { name: "Player 4", y: 3 },
        ],
        innerSize: "65%",
      },
      {
        type: "solidgauge",
        name: "Countdown",
        data: [40],
        innerRadius: "97%",
        radius: "100%",
      },
    ],
  };
  const gaugeChartOptions = {
    chart: {
      type: "solidgauge",
      backgroundColor: "",
    },
    title: {
      text: "",
    },
    pane: {
      center: ["50%", "50%"],
      size: "110%",
      startAngle: 0,
      endAngle: 360,
      background: {
        backgroundColor: "#080808",
        innerRadius: "90%",
        outerRadius: "100%",
        shape: "arc",
      },
    },
    tooltip: {
      enabled: false,
    },
    credits: {
      enabled: false,
    },
    yAxis: {
      min: 0,
      max: 100, // Example total time
      stops: [[1.0, "#ff99ds"]],
      lineWidth: 0,
      tickWidth: 0,
      minorTickInterval: null,
      tickAmount: 0,
      labels: {
        enabled: false,
      },
    },
    plotOptions: {
      solidgauge: {
        dataLabels: {
          enabled: false,
        },
        linecap: "round",
        rounded: true,
      },
    },
    series: [
      {
        name: "Countdown",
        data: [20],
        innerRadius: "90%",
        radius: "100%",
      },
    ],
  };
  return (
    <div className="bg-[#080808] flex">
      {/* Main Content */}
      <div className="flex-1">
        <header className="flex items-center justify-between px-8 py-4 border-b border-zinc-800">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-white">DEGENPOT</div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsChatOpen(!isChatOpen)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2h-4l-4 4-4-4H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              </svg>
            </button>
            <a
              className="text-white hover:text-[#ffcc00] transition-colors"
              href="#"
            >
              <TwitterIcon className="h-6 w-6" />
            </a>
            <a
              className="text-white hover:text-[#ffcc00] transition-colors"
              href="#"
            >
              <DiscIcon className="h-6 w-6" />
            </a>
          </div>
        </header>
        <div className="bg-[#080808] flex flex-col items-center justify-center text-white">
          <div className="flex w-full max-w-7xl p-8">
            {/* LEFT SIDE */}
            <aside className="w-full lg:w-1/2 bg-[#121418] p-4 rounded-l-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">1 Players</h2>
                <div className="flex items-center">
                  <EyeIcon className="h-5 w-5 text-[#7e18ff]" />
                  <span className="ml-2">1 Watching</span>
                </div>
              </div>
              <div className="space-y-2 overflow-y-auto h-[calc(100vh-160px)]">
                {gameData?.players.length === 0 ? (
                  <div className="mx-8 rounded-xl border-[1px] border-[#ffffff50] bg-[#04134A] py-5 mt-[55px] text-[14px] text-[#6a71f8] font-bold text-center">
                    {`Noone has entered this room yet... Be the first! :)`}
                  </div>
                ) : (
                  <div className="">
                    {gameData &&
                      gameData.players?.map((item: any, key: number) => (
                        <div
                          className="flex items-center justify-between"
                          key={key}
                        >
                          <img
                            src="/placeholder.svg"
                            alt="player avatar"
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1 ml-2">
                            <div className="text-sm">
                              {item.player.slice(0, 3)}...
                              {item.player.slice(-3)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {(
                                item.amount / LAMPORTS_PER_SOL
                              ).toLocaleString()}{" "}
                              SOL
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">100%</div>{" "}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </aside>

            {/* CENTER SIDE */}
            <main className="w-full lg:w-3/4 flex flex-col items-center">
              <div className="relative rounded-md p-4 w-full h-full mb-4">
                <HighchartsReact
                  highcharts={Highcharts}
                  options={chartOptions}
                />
                {/* <div className="absolute inset-0">
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={gaugeChartOptions}
                  />
                </div> */}
              </div>
            </main>

            {/* RIGHT SIDE */}
            <aside className="w-full lg:w-1/2 bg-[#121418] p-4 rounded-r-lg">
              <div className="mb-4">
                <h2 className="text-xl font-bold">Round #51920</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-[#202329] p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">Prize Pool</div>
                    <div className="text-sm">{sumPots}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">Players</div>
                    <div className="text-sm">1/100</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">Your Entries</div>
                    <div className="text-sm">-</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">Your Win Chance</div>
                    <div className="text-sm">{winPercent}</div>
                  </div>
                </div>

                <div className="text-white p-4 rounded-md">
                  <div className="rounded-md p-4">
                    {wallet.publicKey ? (
                      <div>
                        <div className="relative mb-4">
                          <input
                            className="bg-stone-950 text-black text-sm py-1 px-3 w-full border-2 border-zinc-800 rounded-md"
                            placeholder="Amount of SOL"
                            type="number"
                            value={betAmount}
                            step={0.1}
                            onChange={(e) =>
                              handleBetAmount(
                                e.target.value as unknown as number
                              )
                            }
                          />
                        </div>

                        <div className="flex gap-1 mb-4">
                          <div className="bg-[#202329] py-1 px-3 flex rounded-md cursor-pointer">
                            0.1 SOL
                          </div>
                          <div className="bg-[#202329] py-1 px-3 flex rounded-md cursor-pointer">
                            0.5 SOL
                          </div>
                          <div className="bg-[#202329] py-1 px-3 flex rounded-md cursor-pointer">
                            5 SOL
                          </div>
                        </div>
                        <button
                          className="bg-[#7e18ff] text-sm font-medium py-2 px-4 w-full rounded-md text-white"
                          onClick={handleBet}
                          disabled={isBetLoading}
                        >
                          {isBetLoading ? (
                            <>Waiting...</>
                          ) : (
                            <>Add {betAmount} SOL to bet</>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="playground">
                        <WalletMultiButton />
                      </div>
                    )}
                  </div>
                </div>
                {/* <Button className="w-full" variant="secondary">
              Round Closed
            </Button> */}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Chat Box */}
      {isChatOpen && (
        <div className="w-[300px] h-[100vh] flex flex-col px-4 pt-4 border-l-[1px] border-[#FFFFFF3D] bg-[#121418]">
          <Chat className="flex flex-col h-full" />
        </div>
      )}
    </div>
  );
}

function ChevronLeftIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ClockIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function EyeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function FileQuestionIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 17h.01" />
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
      <path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3" />
    </svg>
  );
}

function InfoIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function DiscIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function TwitterIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}
