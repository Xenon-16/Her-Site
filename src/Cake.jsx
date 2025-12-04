import './Cake.scss';

function Cake() {
    return (
        <div className="cake-container">
            <div className="cake">
                <div className="tier tier-1">
                    <div className="filling"></div>
                    <div className="icing-group">
                        {[...Array(9)].map((_, i) => <div key={i} className="icing"></div>)}
                    </div>
                </div>
                <div className="tier tier-2">
                    <div className="filling"></div>
                    <div className="icing-group">
                        {[...Array(7)].map((_, i) => <div key={i} className="icing"></div>)}
                    </div>
                </div>
                <div className="tier tier-3">
                    <div className="filling"></div>
                    <div className="icing-group">
                        {[...Array(5)].map((_, i) => <div key={i} className="icing"></div>)}
                    </div>
                </div>
                <div className="candles">
                    <div className="candle">
                        <div className="flame">
                            <div className="flame-in"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cake;
