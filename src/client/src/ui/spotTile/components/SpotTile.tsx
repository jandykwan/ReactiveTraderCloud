/* tslint:disable */

import numeral from 'numeral'
import React, { PureComponent, FC } from 'react'
import { CurrencyPair, Direction, ServiceConnectionStatus } from 'rt-types'
import { createTradeRequest, DEFAULT_NOTIONAL, ExecuteTradeRequest, SpotTileData, TradeRequest } from '../model'
import { spotDateFormatter } from '../model/dateUtils'
import NotionalInput from './notional'
import PriceControls from './PriceControls'
import { DeliveryDate, TileHeader, TileSymbol, SpotTileWrapper, SpotTileStyle } from './styled'
import { usePlatform } from 'rt-components'


const SpotTileWrapperWithPlatform:FC = (props)=>{
  const platform = usePlatform()
  return <SpotTileWrapper {...props} platform={platform}/>
}

export interface Props {
  currencyPair: CurrencyPair
  spotTileData: SpotTileData
  executionStatus: ServiceConnectionStatus
  executeTrade: (tradeRequestObj: ExecuteTradeRequest) => void
}

interface State {
  notional: string
}

export default class SpotTile extends PureComponent<Props, State> {
  state = {
    notional: '1000000',
  }

  updateNotional = (notional: string) => this.setState({ notional })

  executeTrade = (direction: Direction, rawSpotRate: number) => {
    const { currencyPair, executeTrade } = this.props
    const notional = this.getNotional()
    const tradeRequestObj: TradeRequest = {
      direction,
      currencyBase: currencyPair.base,
      symbol: currencyPair.symbol,
      notional,
      rawSpotRate,
    }
    executeTrade(createTradeRequest(tradeRequestObj))
  }

  getNotional = () => numeral(this.state.notional).value() || DEFAULT_NOTIONAL

  canExecute = () => {
    const { spotTileData, executionStatus } = this.props
    return Boolean(
      executionStatus === ServiceConnectionStatus.CONNECTED &&
        !spotTileData.isTradeExecutionInFlight &&
        spotTileData.price,
    )
  }

  render() {
    const {
      currencyPair,
      spotTileData: { price },
      children,
    } = this.props
    const { notional } = this.state

    const spotDate = spotDateFormatter(price.valueDate, false).toUpperCase()

    return (
      <SpotTileWrapperWithPlatform>
        <SpotTileStyle className="spot-tile">
          <TileHeader>
            <TileSymbol>{`${currencyPair.base}/${currencyPair.terms}`}</TileSymbol>
            <DeliveryDate className="delivery-date">{spotDate && `SPT (${spotDate})`} </DeliveryDate>
          </TileHeader>
          <PriceControls
            executeTrade={this.executeTrade}
            priceData={price}
            currencyPair={currencyPair}
            disabled={!this.canExecute()}
          />
          <NotionalInput
            notional={notional}
            currencyPairSymbol={currencyPair.base}
            updateNotional={this.updateNotional}
          />
        </SpotTileStyle>
        {children}
      </SpotTileWrapperWithPlatform>
    )
  }
}
