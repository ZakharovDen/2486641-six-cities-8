import { inject, injectable } from 'inversify';
import { BaseController, HttpMethod, RequestQuery } from '../../libs/rest/index.js';
import { Logger } from '../../libs/logger/logger.interface.js';
import { Component } from '../../types/component.enum.js';
import { OfferService } from './offer-service.interface.js';
import { Request, Response } from 'express';
import { ParamOfferId } from './type/param-offerid.type.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { CreateOfferRequest } from './type/create-offer-request.type.js';
import { fillDTO } from '../../helpers/common.js';
import { ShowOfferRdo } from './rdo/show-offer.rdo.js';
import { IndexOfferRdo } from './rdo/index-offer.rdo.js';
import { ParamCityName } from './type/param-cityname.type.js';

@injectable()
export class OfferController extends BaseController{
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.OfferService) private readonly offerService: OfferService
  ){
    super(logger);
    this.logger.info('Register routes for OfferController...');

    this.addRoute({path: '/', handler: this.index, method: HttpMethod.Get});
    this.addRoute({path: '/', handler: this.create, method: HttpMethod.Post});
    this.addRoute({path: '/:offerId', handler: this.show, method: HttpMethod.Get});
    this.addRoute({path: '/:offerId', handler: this.update, method: HttpMethod.Put});
    this.addRoute({path: '/:offerId', handler: this.delete, method: HttpMethod.Delete});
    this.addRoute({path: '/:offerId/change-favorite', handler: this.changeIsFavorite, method: HttpMethod.Patch});
    this.addRoute({path: '/:cityName/premium', handler: this.getPremiumByCity, method: HttpMethod.Get});
  }

  public async index(
    { query }: Request<unknown, unknown, unknown, RequestQuery>,
    res: Response
  ): Promise<void> {
    const result = await this.offerService.findAll(query.limit);
    this.ok(res, fillDTO(IndexOfferRdo, result));
  }

  public async create(
    { body }: CreateOfferRequest,
    res: Response
  ): Promise<void> {
    const result = await this.offerService.create(body);
    this.created(res, fillDTO(ShowOfferRdo, result));
  }

  public async show(
    { params }: Request<ParamOfferId>,
    res: Response
  ): Promise<void> {
    const {offerId} = params;
    const result = await this.offerService.findById(offerId);
    this.ok(res, fillDTO(ShowOfferRdo, result));
  }

  public async update(
    { body, params }: Request<ParamOfferId, unknown, UpdateOfferDto>,
    res: Response
  ): Promise<void> {
    const {offerId} = params;
    const result = await this.offerService.update(offerId, body);
    this.created(res, fillDTO(ShowOfferRdo, result));
  }

  public async delete(
    { params }: Request<ParamOfferId>,
    res: Response
  ): Promise<void> {
    const { offerId } = params;
    const result = await this.offerService.delete(offerId);
    this.noContent(res, result);
  }

  public async changeIsFavorite(
    { params }: Request<ParamOfferId>,
    res: Response
  ): Promise<void> {
    const {offerId} = params;
    const result = await this.offerService.changeFavorite(offerId);
    this.created(res, fillDTO(ShowOfferRdo, result));
  }

  public async getPremiumByCity({ params }: Request<ParamCityName>, res: Response): Promise<void> {
    const result = await this.offerService.findPremiumByCity(params.cityName);
    this.ok(res, fillDTO(IndexOfferRdo, result));
  }
}