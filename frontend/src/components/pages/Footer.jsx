import React from "react";
import logo from "../../assets/logo.jpg";
import appleStore from "../../assets/icon-AppStore_lg30tv.avif";
import playStore from "../../assets/icon-GooglePlay_1_zixjxl.avif";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="flex flex-col gap-5 px-10 ">
      <div className=" flex flex-row justify-evenly text-[#2c2c2c] font-semibold">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-4 items-center">
            <Link to="/dashboard" className="flex items-center ">
              <img
                src={logo}
                alt="logo"
                className={`rounded-xl object-cover h-10 w-10 `}
              />
            </Link>
            <h2 className="font-bold text-2xl text-[#0b7b2a] ">Cooklio</h2>
          </div>
          <p>&copy; 2026 Cooklio</p>
        </div>
        <div className="flex flex-col gap-4 cursor-pointer">
          <h3 className="text-xl text-black font-semibold cursor-text">Company</h3>
          <span className="text-[#2c2c2c] font-semibold">About</span>
          <span>Team</span>
          <span>Cooklio Click</span>
        </div>
        <div className="flex flex-col gap-4 cursor-pointer">
          <h3 className="text-xl font-semibold text-black cursor-text">Contact us</h3>
          <span>Help & Support</span>
          <span>Partner with us</span>
        </div>
        <div className="flex flex-col gap-4 cursor-pointer">
          <h3 className="text-xl font-semibold text-black cursor-text">Legal</h3>
          <span>Terms & Condition</span>
          <span>Recipe policy</span>
          <span>Privacy Policy</span>
        </div>
        <div className="flex flex-col gap-4 cursor-pointer">
          <h3 className="text-xl font-semibold text-black cursor-text">Social Links</h3>
          <div className="flex flex-row gap-5">
            <Link to={"https://www.instagram.com/anoop_singh_2026/"}><i class="fa-brands fa-square-instagram"></i></Link>
            <Link to={""}><i class="fa-brands fa-facebook"></i></Link>
            <Link to={"https://www.linkedin.com/in/anoop-kumar-singh-8a37a4227/"}><i class="fa-brands fa-linkedin"></i></Link>
            <Link to={"https://x.com/anoop_0x01"}><i class="fa-brands fa-square-twitter"></i></Link>
          </div>
        </div>
      </div>
      <hr />
      <div className="flex flex-row justify-center items-center gap-10 text-[#2c2c2c] font-semibold">
        <h4>For better experience, download the Cooklio app now</h4>
        <div className="flex flex-row gap-4">
          <img src={appleStore} alt="apple-store-icon" />
          <img src={playStore} alt="play-store-icon" />
        </div>
      </div>
    </div>
  );
};

export default Footer;
