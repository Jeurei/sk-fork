export const enum StateIds {
    // костыль: где-то там есть механизм удаления заказов,
    // который не аффектит state_id/state_kind
    // поэтому я сам его аффекчу, если заказа нет в текущих,
    // а его state_kind !== 'finished' && state_kind !== 'aborted'
    PseudoNotFound = -1, // 'aborted'

    // Принят
    Created = 1, // 'new_order'
    // В работе
    InWork = 2, // 'xxxxxx'
    // В очереди
    Queued = 3, // 'xxxxxx'
    // Выполнен
    Completed = 4, // 'xxxxxx'
    // Прекращен
    Aborted = 5, // 'aborted'
    // Нет машин
    NoCars = 6, // 'aborted'
    // Водитель принял заказ
    DriverAccepted = 7, // 'driver_assigned'
    // Водитель принял заказ по времени
    DriverAcceptedByTime = 8, // 'xxxxxx'
    // Водитель отказался от заказа
    DriverDeclined2 = 9, // 'xxxxxx' // unlisted
    // Водитель подъехал на место
    DriverAtSourcePoint = 10, // 'xxxxxx'
    // Клиент в машине
    ClientInCar = 11, // 'xxxxxx'
    // Клиент не вышел
    ClientNotOut = 12, // 'xxxxxx'
    // Заказ отправлен водителю
    SentToDriver = 13, // 'xxxxxx'
    // Заказ получен водителем
    ReadByDriver = 14, // 'xxxxxx'
    // Заказ завершен успешно
    CompletedSuccessful = 15, // 'xxxxxx' // unlisted
    // Заказ завершен неуспешно
    CompletedUnsuccessful = 16, // 'xxxxxx' // unlisted
    // Завершение бордюрного заказа
    CompletedBordur = 17, // 'xxxxxx' // unlisted
    // Экипаж на месте
    CarAtSourcePoint = 18, // 'xxxxxx' // unlisted
    // Бордюр
    Bordur = 19, // 'xxxxxx' // unlisted
    // Начало простоя экипажа
    CarWasteTime = 20, // 'xxxxxx' // unlisted
    // Отправить в ЦОЗ
    SendingToUDS = 21, // 'xxxxxx' // unlisted
    // Отправлен в ЦОЗ
    SentToUDS = 22, // 'xxxxxx' // unlisted
    // ЦОЗ.Принят службой
    UDSAccepted = 23, // 'xxxxxx' // unlisted
    // ЦОЗ.Водитель назначен
    UDSDriverAssigned = 24, // 'xxxxxx' // unlisted
    // ЦОЗ.Ошибка отправки заказа
    UDSSendOrderError = 25, // 'xxxxxx' // unlisted
    // Заказ выполнен (ЦОЗ)
    UDSCompleted = 26, // 'xxxxxx' // unlisted
    // ЦОЗ.Исполнитель отказался
    UDSExecutorDeclined = 27, // 'xxxxxx' // unlisted
    // Снят с ЦОЗ
    UDSFree = 28, // 'xxxxxx' // unlisted
    // Принят из ЦОЗ
    AccpetedFromUDS = 29, // 'xxxxxx' // unlisted
    // ЦОЗ.Отказ от заказа
    UDSRejected = 30, // 'xxxxxx' // unlisted
    // ЦОЗ.Отозван создателем
    UDSRejectedBeCreator = 31, // 'xxxxxx' // unlisted
    // Отправлен в РБТ
    SentToRBT = 32, // 'xxxxxx' // unlisted
    // Аукцион в РБТ
    AuctionInRBT = 33, // 'xxxxxx' // unlisted
    // Принят из РБТ
    AcceptedInRBT = 34, // 'xxxxxx' // unlisted
    // Предварительный заказ
    Prior = 35, // 'new_order'
    // Водитель отказался
    DriverDeclined = 36, // 'new_order'
    // Клиент не вышел
    ClientNotOut2 = 39, // 'aborted'
    // Клиент оповещён!
    ClientNoticed = 41, // 'xxxxxx'
    // Не дозвонились!
    CallFailed = 42, // 'xxxxxx'
    // Звонок клиенту
    CallingToClient = 43, // 'xxxxxx'
    // ЦОЗ. Клиент в машине
    UDSClientInCar = 46, // 'xxxxxx' // unlisted
    // Висячая заявка
    SuspendedOrder = 47, // 'xxxxxx' // unlisted
    // Выходят!!!
    ClientOut = 50, // 'xxxxxx'
    // Отправить в обменник
    SendToExchange = 51, // 'xxxxxx' // unlisted
    // Водитель может отменить!
    DriverWannaCancel = 60, // 'xxxxxx' // unlisted
    // Водитель звонит пассажиру
    DriverCallingToClient = 61, // 'xxxxxx' // unlisted
    // водитель дозвонился пассажиру
    DriverCallDoneToClient = 62, // 'xxxxxx' // unlisted
    // Водитель не дозвонился пассажиру
    DriverCallFailedToClient = 63, // 'xxxxxx' // unlisted
    // Водила пытается отменить раньше времени
    DriverWannaCancelEarly = 65, // 'xxxxxx' // unlisted
    // водитель пытается отменить раньше времени
    DriverWannaCancelEarly2 = 69, // 'xxxxxx' // unlisted
    // заказ с биржи превышает время ожидания
    AuctionTimeout = 70, // 'xxxxxx' // unlisted
    // Отправлено в обменник
    SendToExchange2 = 75, // 'xxxxxx' // unlisted
    // Ожидание оплаты
    WaitingForPayment = 79, // 'xxxxxx' // unlisted
    // Заказ с приложения
    OrderFromApp = 80, // 'xxxxxx' // unlisted
    // Заказ с приложения без координат
    OrderFromAppNoCoords = 81, // 'xxxxxx' // unlisted
    // Отказались с приложения
    AbortedByApp = 82, // 'xxxxxx' // unlisted
    // звонок клиенту по таймауту
    CallingToClientByTimeout = 87, // 'new_order'
    // Клиент оповещен
    ClientNoticed2 = 88, // 'xxxxxx'
    // СРОЧНО НАЗВАТЬ МАШИНУ!!!
    CallCarImmediate = 90, // 'xxxxxx' // unlisted
    // изменение цены
    CostChange = 92, // 'xxxxxx' // unlisted
    // Отказ от заказа через сайт
    AbortedBySite = 93, // 'aborted'
    // Клиент отменил по телефону
    AbortedByPhone = 94, // 'aborted'
    // Пассажир звонит водителю
    ClientCallingToDriver = 96, // 'xxxxxx'
    // Пассажир дозвонился водителю
    ClientCallDoneToDriver = 97, // 'xxxxxx'
    // Пассажир не дозвонился водителю
    ClientCallFailedToDriver = 98, // 'xxxxxx'
    // Заказ с сайта
    OrderFromSite = 100, // 'new_order'
};

export type OrderState = {
    order_id: number;
    state_id: StateIds;
    state_kind: 'new_order' | 'driver_assigned' | 'car_at_place' | 'client_inside' | 'finished' | 'aborted';
    confirmed: 'not_confirmed' | 'confirmed_by_driver' | 'confirmed_by_oper';
    order_params: number[];
    server_time_offset: number;

    client_id: number;
    phone: string;

    is_prior: boolean;
    is_really_prior: boolean;
    prior_crew_id: number;

    driver_id: number;

    car_id: number;
    car_mark: string;
    car_model: string;
    car_color: string;
    car_number: string;

    crew_id: number;
    crew_coords?: {
        lat: number;
        lon: number;
    };

    source: string;
    source_time: string;
    source_lat: number;
    source_lon: number;

    stops: {
        address: string;
        lat: number;
        lon: number;
    }[];

    destination: string;
    destination_lat: number;
    destination_lon: number;
};
